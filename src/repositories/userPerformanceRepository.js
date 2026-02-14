import { pool } from '../config/database.js';

export const getUserPerformance = async (id_user, id_experimento) => {
  const [rows] = await pool.query(
    `
    SELECT 
      up.total_time_seconds,
      up.stress_level,
      up.productivity_level,
      up.work_phase_productivity,
      up.restart_count,
      e.estado,
      e.performance_visible
    FROM UserPerformance up
    INNER JOIN Experimento e ON up.id_experimento = e.id_experimento
    WHERE up.id_user = ? AND up.id_experimento = ?
    `,
    [id_user, id_experimento]
  );

  return rows[0];
};
