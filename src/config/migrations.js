import { pool } from '../config/database.js';

/**
 * Sistema de Migraciones - Enfoque Escalable con Tabla Débil
 */

/**
 * Crear base de datos si no existe
 */
const createDatabase = async () => {
    try {
        console.log('🔄 Verificando base de datos DBProductAPP...');

        const [databases] = await pool.query(
            "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'DBProductAPP'"
        );

        if (databases.length === 0) {
            console.log('➕ Creando base de datos DBProductAPP...');
            await pool.query('CREATE DATABASE DBProductAPP CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci');
            console.log('✅ Base de datos creada');
        } else {
            console.log('✓ Base de datos ya existe');
        }
    } catch (error) {
        console.error('❌ Error al crear base de datos:', error.message);
        throw error;
    }
};

/**
 * Tabla principal de usuarios
 */
const migrateUserTable = async () => {
    try {
        console.log('🔄 Verificando tabla user...');

        const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'DBProductAPP' 
        AND TABLE_NAME = 'user'
    `);

        if (tables.length === 0) {
            console.log('➕ Creando tabla user...');

            await pool.query('USE DBProductAPP');
            await pool.query(`
        CREATE TABLE user (
          id_user INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          rut VARCHAR(12) NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NULL,
          role ENUM('ADMIN', 'DOCENTE', 'USUARIO') NOT NULL DEFAULT 'USUARIO',
          gender ENUM('Masculino', 'Femenino', 'Otro') NULL,
          date_of_birth DATE NULL,
          status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
          registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reset_token VARCHAR(255) NULL,
          reset_token_expires DATETIME NULL,
          picture VARCHAR(500) NULL,
          INDEX idx_email (email),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

            console.log('✅ Tabla user creada');
        } else {
            console.log('✓ Tabla user ya existe');
        }
    } catch (error) {
        console.error('❌ Error en migración de tabla user:', error.message);
        throw error;
    }
};

/**
 * Tabla débil/esclava de proveedores de autenticación
 * Permite múltiples métodos de auth por usuario (escalable)
 */
const migrateUserAuthProvidersTable = async () => {
    try {
        console.log('🔄 Verificando tabla user_auth_providers...');

        const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'DBProductAPP' 
        AND TABLE_NAME = 'user_auth_providers'
    `);

        if (tables.length === 0) {
            console.log('➕ Creando tabla user_auth_providers...');

            await pool.query('USE DBProductAPP');
            await pool.query(`
        CREATE TABLE user_auth_providers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          provider ENUM('LOCAL', 'GOOGLE') NOT NULL,
          provider_user_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL,

          FOREIGN KEY (user_id)
            REFERENCES user(id_user)
            ON DELETE CASCADE,

          UNIQUE (provider, provider_user_id),
          UNIQUE (user_id, provider)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);

            console.log('✅ Tabla user_auth_providers creada');
        } else {
            console.log('✓ Tabla user_auth_providers ya existe');
        }
    } catch (error) {
        console.error('❌ Error en migración user_auth_providers:', error.message);
        throw error;
    }
};

/**
 * Ejecutar todas las migraciones
 */
export const runMigrations = async () => {
    try {
        console.log('\n🚀 Iniciando migraciones...\n');

        await createDatabase();
        await migrateUserTable();
        await migrateUserAuthProvidersTable();

        console.log('\n✅ Migraciones completadas\n');
    } catch (error) {
        console.error('\n❌ Error en migraciones:', error.message);
        throw error;
    }
};
