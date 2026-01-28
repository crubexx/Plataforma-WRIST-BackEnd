import { pool } from '../config/database.js';

/**
 * Sistema de Migraciones - Seguro y Escalable
 */

/**
 * Crear base de datos si no existe
 */
const createDatabase = async () => {
  console.log('🔄 Verificando base de datos DBProductAPP...');

  const [databases] = await pool.query(`
    SELECT SCHEMA_NAME 
    FROM INFORMATION_SCHEMA.SCHEMATA 
    WHERE SCHEMA_NAME = 'DBProductAPP'
  `);

  if (databases.length === 0) {
    console.log('➕ Creando base de datos DBProductAPP...');
    await pool.query(`
      CREATE DATABASE DBProductAPP 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_0900_ai_ci
    `);
    console.log('✅ Base de datos creada');
  } else {
    console.log('✓ Base de datos ya existe');
  }
};

/**
 * Tabla principal User
 */
const migrateUserTable = async () => {
  console.log('🔄 Verificando tabla User...');

  const [tables] = await pool.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'User'
  `);

  await pool.query('USE DBProductAPP');

  if (tables.length === 0) {
    console.log('➕ Creando tabla User...');

    await pool.query(`
      CREATE TABLE User (
        id_user INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        rut VARCHAR(12) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        role ENUM('SUPERADMIN','ADMIN','DOCENTE','USUARIO') NOT NULL DEFAULT 'USUARIO',
        gender ENUM('Masculino','Femenino','Otro'),
        date_of_birth DATE,
        status ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_token VARCHAR(255),
        reset_token_expires DATETIME,
        picture VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Tabla User creada');
  } else {
    console.log('✓ Tabla User ya existe, verificando columnas...');

    const [columns] = await pool.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'User'
  `);

    const existingColumns = columns.map(c => c.COLUMN_NAME);

    const alterQueries = [];

    if (!existingColumns.includes('reset_token')) {
      alterQueries.push(`ADD COLUMN reset_token VARCHAR(255)`);
    }

    if (!existingColumns.includes('reset_token_expires')) {
      alterQueries.push(`ADD COLUMN reset_token_expires DATETIME`);
    }

    if (!existingColumns.includes('picture')) {
      alterQueries.push(`ADD COLUMN picture VARCHAR(500)`);
    }

    if (alterQueries.length > 0) {
      await pool.query(`
      ALTER TABLE User
      ${alterQueries.join(',')}
    `);

      console.log('✓ Columnas faltantes agregadas a User');
    }

    // Verificar y actualizar ENUM de role si es necesario
    const [roleColumn] = await pool.query(`
    SELECT COLUMN_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'User'
      AND COLUMN_NAME = 'role'
  `);

    if (roleColumn.length > 0 && !roleColumn[0].COLUMN_TYPE.includes('SUPERADMIN')) {
      console.log('🔄 Actualizando ENUM de roles para incluir SUPERADMIN...');
      await pool.query(`
      ALTER TABLE User 
      MODIFY COLUMN role ENUM('SUPERADMIN','ADMIN','DOCENTE','USUARIO') NOT NULL DEFAULT 'USUARIO'
    `);
      console.log('✅ ENUM de roles actualizado');
    } else {
      console.log('✓ Tabla User ya está actualizada');
    }
  }
};

/**
 * Tabla débil de proveedores de autenticación
 */
const migrateUserAuthProvidersTable = async () => {
  console.log('🔄 Verificando tabla UserAuthProviders...');

  const [tables] = await pool.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'UserAuthProviders'
  `);

  await pool.query('USE DBProductAPP');

  if (tables.length === 0) {
    console.log('➕ Creando tabla UserAuthProviders...');

    await pool.query(`
      CREATE TABLE UserAuthProviders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider ENUM('LOCAL','GOOGLE') NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,

        FOREIGN KEY (user_id)
          REFERENCES User(id_user)
          ON DELETE CASCADE,

        UNIQUE (provider, provider_user_id),
        UNIQUE (user_id, provider)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Tabla UserAuthProviders creada');
  } else {
    console.log('✓ Tabla UserAuthProviders ya existe');
  }
};

/**
 * Ejecutar migraciones
 */
export const runMigrations = async () => {
  console.log('\n🚀 Iniciando migraciones...\n');

  await createDatabase();
  await migrateUserTable();
  await migrateUserAuthProvidersTable();

  console.log('\n✅ Migraciones completadas correctamente\n');
};
