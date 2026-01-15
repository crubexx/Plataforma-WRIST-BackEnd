import { pool } from '../config/database.js';

// Buscar usuario por email
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM User WHERE email = ?',
    [email]
  );

  return rows.length > 0 ? rows[0] : null;
};

// Buscar usuario por RUT
export const findUserByRut = async (rut) => {
  const sql = `SELECT id_user FROM User WHERE rut = ? LIMIT 1`;
  const [rows] = await pool.execute(sql, [rut]);
  return rows.length > 0 ? rows[0] : null;
};

// Guardar token de recuperación
export const saveResetToken = async (email, token, expires) => {
  await pool.query(
    `UPDATE User 
     SET reset_token = ?, reset_token_expires = ?
     WHERE email = ?`,
    [token, expires, email]
  );
};

// Buscar usuario por token
export const findUserByResetToken = async (token) => {
  const [rows] = await pool.query(
    `SELECT * FROM User 
     WHERE reset_token = ? 
     AND reset_token_expires > NOW()`,
    [token]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Actualizar contraseña
export const updatePassword = async (id_user, password_hash) => {
  await pool.query(
    `UPDATE User
     SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL
     WHERE id_user = ?`,
    [password_hash, id_user]
  );
};

// ACC-002: Crear usuario
export const createUser = async (userData) => {
  const {
    first_name,
    last_name,
    rut,
    email,
    password_hash,
    role,
    gender,
    date_of_birth
  } = userData;

  const [result] = await pool.query(
    `INSERT INTO User 
      (first_name, last_name, rut, email, password_hash, role, gender, date_of_birth, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      first_name,
      last_name,
      rut,
      email,
      password_hash,
      role,
      gender,
      date_of_birth
    ]
  );

  return result.insertId;
};