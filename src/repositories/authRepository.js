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