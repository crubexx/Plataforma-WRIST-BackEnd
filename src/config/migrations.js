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
 * Tabla UserSession - Sesiones activas de usuarios
 */
const migrateUserSessionTable = async () => {
  console.log('🔄 Verificando tabla UserSession...');

  const [tables] = await pool.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'UserSession'
  `);

  await pool.query('USE DBProductAPP');

  if (tables.length === 0) {
    console.log('➕ Creando tabla UserSession...');

    await pool.query(`
      CREATE TABLE UserSession (
        id_session INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        session_token VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (id_user) 
          REFERENCES User(id_user)
          ON DELETE CASCADE,
          
        INDEX idx_user (id_user),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Tabla UserSession creada');
  } else {
    console.log('✓ Tabla UserSession ya existe');
  }
};

/**
 * Tabla Experiment - Experimentos/Experiencias
 */
const migrateExperimentTable = async () => {
  console.log('🔄 Verificando tabla Experiment...');

  const [tables] = await pool.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'Experiment'
  `);

  await pool.query('USE DBProductAPP');

  if (tables.length === 0) {
    console.log('➕ Creando tabla Experiment...');

    await pool.query(`
      CREATE TABLE Experiment (
        id_experiment INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration INT COMMENT 'Duración en minutos',
        status ENUM('CREATED','ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'CREATED',
        created_by INT NOT NULL,
        start_date DATETIME COMMENT 'Fecha y hora de inicio',
        end_date DATETIME COMMENT 'Fecha y hora de finalización',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (created_by) 
          REFERENCES User(id_user)
          ON DELETE CASCADE,
          
        INDEX idx_created_by (created_by),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Tabla Experiment creada');
  } else {
    console.log('✓ Tabla Experiment ya existe, verificando columnas...');

    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'DBProductAPP'
        AND TABLE_NAME = 'Experiment'
    `);

    const existingColumns = columns.map(c => c.COLUMN_NAME);
    const alterQueries = [];

    if (!existingColumns.includes('duration')) {
      alterQueries.push(`ADD COLUMN duration INT COMMENT 'Duración en minutos'`);
    }

    if (!existingColumns.includes('start_date')) {
      alterQueries.push(`ADD COLUMN start_date DATETIME COMMENT 'Fecha y hora de inicio'`);
    }

    if (!existingColumns.includes('end_date')) {
      alterQueries.push(`ADD COLUMN end_date DATETIME COMMENT 'Fecha y hora de finalización'`);
    }

    if (!existingColumns.includes('updated_at')) {
      alterQueries.push(`ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    }

    if (alterQueries.length > 0) {
      await pool.query(`
        ALTER TABLE Experiment
        ${alterQueries.join(',')}
      `);
      console.log('✓ Columnas faltantes agregadas a Experiment');
    } else {
      console.log('✓ Tabla Experiment ya está actualizada');
    }
  }
};

/**
 * Tabla Question - Preguntas de experiencias
 */
const migrateQuestionTable = async () => {
  console.log('🔄 Verificando tabla Question...');

  const [tables] = await pool.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'Question'
  `);

  await pool.query('USE DBProductAPP');

  if (tables.length === 0) {
    console.log('➕ Creando tabla Question...');

    await pool.query(`
      CREATE TABLE Question (
        id_question INT AUTO_INCREMENT PRIMARY KEY,
        id_experiment INT NOT NULL,
        question_text TEXT NOT NULL,
        question_order INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (id_experiment) 
          REFERENCES Experiment(id_experiment) 
          ON DELETE CASCADE,
          
        INDEX idx_experiment (id_experiment)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Tabla Question creada');
  } else {
    console.log('✓ Tabla Question ya existe');
  }
};

/**
 * Tabla QuestionAlternative - Alternativas de respuesta
 */
const migrateQuestionAlternativeTable = async () => {
  console.log('🔄 Verificando tabla QuestionAlternative...');

  const [tables] = await pool.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'DBProductAPP'
      AND TABLE_NAME = 'QuestionAlternative'
  `);

  await pool.query('USE DBProductAPP');

  if (tables.length === 0) {
    console.log('➕ Creando tabla QuestionAlternative...');

    await pool.query(`
      CREATE TABLE QuestionAlternative (
        id_alternative INT AUTO_INCREMENT PRIMARY KEY,
        id_question INT NOT NULL,
        alternative_text VARCHAR(500) NOT NULL,
        alternative_order INT NOT NULL DEFAULT 1,
        
        FOREIGN KEY (id_question) 
          REFERENCES Question(id_question) 
          ON DELETE CASCADE,
          
        INDEX idx_question (id_question)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Tabla QuestionAlternative creada');
  } else {
    console.log('✓ Tabla QuestionAlternative ya existe');
  }
};

/**
 * Ejecutar migraciones
 */
export const runMigrations = async () => {
  try {
    console.log('🚀 Iniciando migraciones...\n');

    await createDatabase();
    await migrateUserTable();
    await migrateUserAuthProvidersTable();
    await migrateUserSessionTable();
    await migrateExperimentTable();
    await migrateQuestionTable();
    await migrateQuestionAlternativeTable();

    console.log('\n✅ Todas las migraciones completadas exitosamente');
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    throw error;
  }
};
