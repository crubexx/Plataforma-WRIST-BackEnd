import { pool } from '../config/database.js';

export const getUserFeedback = async (id_user, id_experimento) => {
  const [rows] = await pool.query(
    `
    SELECT f.id_feedback, f.message, f.created_at
    FROM ExperimentFeedback f
    LEFT JOIN GrupoUsuario gu ON gu.id_group = f.id_group
    WHERE 
      f.id_experimento = ?
      AND (
        f.id_user = ?
        OR gu.id_user = ?
        OR (f.id_group IS NULL AND f.id_user IS NULL)
      )
    ORDER BY f.created_at DESC
    `,
    [id_experimento, id_user, id_user]
  );

  return rows;
};