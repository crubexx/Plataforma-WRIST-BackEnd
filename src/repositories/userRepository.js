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