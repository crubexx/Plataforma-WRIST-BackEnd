import { pool } from '../config/database.js';

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
