import { pool } from '../config/database.js';

// ADM-003: Eliminar usuario
export const deleteUserRepository = async (userId) => {
  const [result] = await pool.query(
    `UPDATE User
     SET status = 'SUSPENDED'
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
      id_user,
      first_name,
      last_name,
      rut,
      email,
      role,
      status,
      gender,
      date_of_birth,
      picture
    FROM User
    WHERE role != 'SUPERADMIN'
    AND status <> 'SUSPENDED'
    ORDER BY
      CASE status
        WHEN 'ACTIVE' THEN 1
        WHEN 'BLOCKED' THEN 2
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

// Ver usuarios suspendidos (SuperAdmin)
export const getSuspendedUsersRepository = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id_user,
      first_name,
      last_name,
      rut,
      email,
      role,
      status,
      gender,
      date_of_birth,
      picture,
      registration_date
    FROM User
    WHERE status = 'SUSPENDED'
    ORDER BY registration_date DESC
  `);

  return rows;
};

// ADM-004 / ADM-005: Editar usuario y estado
export const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM User WHERE id_user = ?',
    [id]
  );
  return rows[0];
};

export const updateUserRepository = async (id, data) => {
  const fields = [];
  const values = [];

  for (const key in data) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (!fields.length) return;

  values.push(id);

  await pool.query(
    `UPDATE User SET ${fields.join(', ')} WHERE id_user = ?`,
    values
  );
};

// CAMBIAR NOMBRES BDD DEL LAB
// ADM-006: Ver historial de experiencias
export const getAllExperiencesRepository = async () => {
  const [rows] = await pool.query(`
    SELECT
      e.id_experiment,
      e.name,
      e.description,
      e.status,
      e.start_date,
      e.end_date,
      CONCAT(u.first_name, ' ', u.last_name) AS responsable,
      u.role AS rol_responsable
    FROM Experimento e
    INNER JOIN User u ON e.id_user = u.id_user
    ORDER BY e.fecha_inicio DESC
  `);

  return rows;
};