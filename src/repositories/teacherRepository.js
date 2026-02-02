import { pool } from '../config/database.js';

export const createExperienceRepository = async ({
  name,
  description,
  user_id
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO Experiment
      (name, description, status, user_id, created_at)
    VALUES
      (?, ?, 'CREATED', ?, NOW())
    `,
    [name, description, user_id]
  );

  return result.insertId;
};

// DOE-002: Obtener experiencias del docente logueado
export const getTeacherExperiencesRepository = async (teacherId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_experiment,
      name,
      status,
      created_at
    FROM Experimento
    WHERE id_user = ?
    ORDER BY created_at DESC
    `,
    [teacherId]
  );

  return rows;
};

// DOE-003: Usuarios conectados actualmente
export const getConnectedUsersRepository = async () => {
  const [rows] = await pool.query(`
    SELECT DISTINCT
      u.first_name,
      u.last_name
    FROM UserSession s
    INNER JOIN User u ON u.id_user = s.id_user
    WHERE s.is_active = TRUE
      AND u.role = 'USUARIO'
  `);

  return rows;
};

// DOE-004: Crear equipos
// Validar experiencia del docente
export const findExperimentByIdAndTeacher = async (
  experimentId,
  teacherId
) => {
  const [rows] = await pool.query(
    `
    SELECT id_experiment
    FROM Experiment
    WHERE id_experiment = ?
      AND created_by = ?
      AND status = 'ACTIVE'
    `,
    [experimentId, teacherId]
  );

  return rows[0];
};

// Crear equipo
export const createGroupRepository = async ({ name, id_experiment }) => {
  const [result] = await pool.query(
    `
    INSERT INTO \`Group\` (name, is_active, id_experiment)
    VALUES (?, true, ?)
    `,
    [name, id_experiment]
  );

  return result.insertId;
};