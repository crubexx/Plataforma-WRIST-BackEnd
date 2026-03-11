import { pool } from '../config/database.js';

export const getUserPerformance = async (id_user, id_experiment) => {
  const [rows] = await pool.query(
    `
    SELECT 
      up.total_time_seconds,
      up.stress_level,
      up.productivity_level,
      up.work_phase_productivity,
      up.restart_count,
      e.status,
      e.performance_visible,
      e.start_date
    FROM userperformance up
    INNER JOIN experiment e ON up.id_experiment = e.id_experiment
    WHERE up.id_user = ? AND up.id_experiment = ?
    `,
    [id_user, id_experiment]
  );

  return rows[0];
};
