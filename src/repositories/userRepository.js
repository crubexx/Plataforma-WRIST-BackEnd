import { pool } from '../config/database.js';

export const getExperiencesByDateRepository = async (date) => {
  const [rows] = await pool.query(`
    SELECT
      e.id_experiment,
      e.name,
      e.status,
      e.start_date,
      e.end_date,
      e.max_participants,
      COUNT(ug.id_user) AS participants_count
    FROM Experiment e
    LEFT JOIN \`Group\` g ON g.id_experiment = e.id_experiment
    LEFT JOIN UserGroup ug ON ug.id_group = g.id_group
    WHERE DATE(e.start_date) = ?
    GROUP BY e.id_experiment
    ORDER BY e.start_date ASC
  `, [date]);

  return rows;
};

export const findExperienceById = async (id_experience) => {
  const [rows] = await pool.query(
    `SELECT * FROM experience WHERE id_experience = ?`,
    [id_experience]
  );
  return rows[0];
};

export const countParticipants = async (id_experience) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM experience_user WHERE id_experience = ?`,
    [id_experience]
  );
  return rows[0].total;
};

export const isUserAlreadyJoined = async (id_experience, id_user) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM experience_user WHERE id_experience = ? AND id_user = ?`,
    [id_experience, id_user]
  );
  return rows.length > 0;
};

export const joinExperience = async (id_experience, id_user) => {
  await pool.query(
    `INSERT INTO experience_user (id_experience, id_user)
     VALUES (?, ?)`,
    [id_experience, id_user]
  );
};