import { pool } from '../config/database.js';

export const getUserFeedback = async (id_user, id_experiment) => {
  const [rows] = await pool.query(
    `
    SELECT f.id_feedback, f.message, f.created_at
    FROM ExperimentFeedback f
    LEFT JOIN UserGroup ug ON ug.id_group = f.id_group
    WHERE 
      f.id_experiment = ?
      AND (
        f.id_user = ?
        OR ug.id_user = ?
        OR (f.id_group IS NULL AND f.id_user IS NULL)
      )
    ORDER BY f.created_at DESC
    `,
    [id_experiment, id_user, id_user]
  );

  return rows;
};