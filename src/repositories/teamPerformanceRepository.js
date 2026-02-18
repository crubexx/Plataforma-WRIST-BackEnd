import { pool } from '../config/database.js';

export const getTeamPerformance = async (id_group, id_experiment) => {
  const [rows] = await pool.query(
    `
    SELECT 
      SUM(up.total_time_seconds) AS total_time_seconds,
      AVG(up.stress_level) AS avg_stress_level,
      AVG(up.productivity_level) AS avg_productivity_level,
      AVG(up.work_phase_productivity) AS avg_phase_productivity,
      SUM(up.restart_count) AS total_restarts,
      e.status,
      e.performance_visible
    FROM UserPerformance up
    INNER JOIN UserGroup ug ON up.id_user = ug.id_user
    INNER JOIN Experiment e ON up.id_experiment = e.id_experiment
    WHERE ug.id_group = ?
      AND up.id_experiment = ?
    `,
    [id_group, id_experiment]
  );

  return rows[0];
};