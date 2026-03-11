import { pool } from '../config/database.js';

// ============================================
// User Repository
// ============================================

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
  const [rows] = await pool.execute(
    'SELECT id_user FROM User WHERE rut = ? LIMIT 1',
    [rut]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Buscar usuario por ID
export const findUserById = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM User WHERE id_user = ?',
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Crear usuario
export const createUser = async (userData) => {
  const {
    first_name,
    last_name,
    rut,
    email,
    password_hash,
    role,
    gender,
    date_of_birth,
    picture
  } = userData;

  const [result] = await pool.query(
    `INSERT INTO User 
      (first_name, last_name, rut, email, password_hash, role, gender, date_of_birth, picture, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
    [first_name, last_name, rut, email, password_hash, role, gender, date_of_birth, picture]
  );

  return result.insertId;
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

// Buscar usuario por token de recuperación
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

// ============================================
// Auth Providers Repository (Tabla Débil)
// ============================================

// Buscar provider por tipo y provider_user_id
export const findAuthProvider = async (provider, providerUserId) => {
  const [rows] = await pool.query(
    'SELECT * FROM UserAuthProviders WHERE provider = ? AND provider_user_id = ?',
    [provider, providerUserId]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Buscar provider por user_id y tipo
export const findAuthProviderByUser = async (userId, provider) => {
  const [rows] = await pool.query(
    'SELECT * FROM UserAuthProviders WHERE user_id = ? AND provider = ?',
    [userId, provider]
  );
  return rows.length > 0 ? rows[0] : null;
};

// Crear auth provider
export const createAuthProvider = async (providerData) => {
  const { user_id, provider, provider_user_id } = providerData;

  const [result] = await pool.query(
    `INSERT INTO UserAuthProviders
      (user_id, provider, provider_user_id, last_login)
     VALUES (?, ?, ?, NOW())`,
    [user_id, provider, provider_user_id]
  );

  return result.insertId;
};

// Actualizar último login de provider
export const updateAuthProviderLastLogin = async (providerId) => {
  await pool.query(
    'UPDATE UserAuthProviders SET last_login = NOW() WHERE id = ?',
    [providerId]
  );
};

// Obtener usuario con su provider (JOIN)
export const getUserWithProvider = async (provider, providerUserId) => {
  const [rows] = await pool.query(
    `SELECT u.*, p.id as provider_id, p.provider, p.last_login as provider_last_login
     FROM User u
     INNER JOIN UserAuthProviders p ON u.id_user = p.user_id
     WHERE p.provider = ? AND p.provider_user_id = ?`,
    [provider, providerUserId]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const updateGoogleUserData = async (
  id_user,
  rut,
  gender,
  date_of_birth,
  password_hash
) => {
  await pool.query(
    `
    UPDATE User
    SET rut = ?, gender = ?, date_of_birth = ?, password_hash = ?
    WHERE id_user = ?
    `,
    [rut, gender, date_of_birth, password_hash, id_user]
  );
};