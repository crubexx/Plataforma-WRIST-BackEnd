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
