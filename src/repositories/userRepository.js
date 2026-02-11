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

export const findUserProfileById = async (id_user) => {
  const [rows] = await pool.query(
    `
    SELECT 
      id_user,
      first_name,
      last_name,
      email,
      role,
      status,
      picture,
      created_at
    FROM User
    WHERE id_user = ?
    `,
    [id_user]
  );

  return rows[0];
};

export const getUserExperienceResultsRepository = async (id_user) => {
  const [rows] = await pool.query(
    `
    SELECT
      e.id_experiment,
      e.name AS experience_name,
      e.status,
      r.productivity_score,
      r.stress_level,
      r.feedback,
      r.created_at
    FROM UserExperienceResult r
    INNER JOIN Experimento e ON r.id_experiment = e.id_experiment
    WHERE r.id_user = ?
    ORDER BY r.created_at DESC
    `,
    [id_user]
  );

  return rows;
};

export const getUserAveragesRepository = async (id_user) => {
  const [rows] = await pool.query(
    `
    SELECT
      AVG(productivity_score) AS avg_productivity,
      AVG(stress_level) AS avg_stress
    FROM UserExperienceResult
    WHERE id_user = ?
    `,
    [id_user]
  );

  return rows[0];
};