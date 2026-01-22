import { pool } from '../config/database.js';

// ADM-003: Eliminar usuario
export const deleteUserRepository = async (userId) => {
  const [result] = await pool.query(
    `UPDATE User
     SET status = 'DELETED'
     WHERE id_user = ?`,
    [userId]
  );

  return result.affectedRows;
};

// ADM-003: Buscar usuario para eliminarlo
export const findUserByIdAdmin = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id_user, role, status
     FROM User
     WHERE id_user = ?`,
    [userId]
  );

  return rows.length ? rows[0] : null;
};

// ADM-001: Ver todos los usuarios
export const getAllUsersRepository = async () => {
  const [rows] = await pool.query(`
    SELECT 
      first_name,
      last_name,
      rut,
      email,
      role,
      status
    FROM User
    WHERE role != 'SUPERADMIN'
    ORDER BY
      CASE status
        WHEN 'ACTIVE' THEN 1
        WHEN 'BLOCKED' THEN 2
        WHEN 'DELETED' THEN 3
      END,
      CASE role
        WHEN 'DOCENTE' THEN 1
        WHEN 'USUARIO' THEN 2
        WHEN 'ADMIN' THEN 3
      END,
      first_name ASC
  `);

  return rows;
};
