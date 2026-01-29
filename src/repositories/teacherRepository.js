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