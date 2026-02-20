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
    WHERE DATE(COALESCE(e.start_date, e.created_at)) = ?
    GROUP BY e.id_experiment
    ORDER BY COALESCE(e.start_date, e.created_at) DESC
  `, [date]);

  return rows;
};

export const findExperienceById = async (id_experiment) => {
  const [rows] = await pool.query(
    `SELECT * FROM Experiment WHERE id_experiment = ?`,
    [id_experiment]
  );
  return rows[0];
};

export const countParticipants = async (id_experiment) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM UserExperience WHERE id_experiment = ?`,
    [id_experiment]
  );
  return rows[0].total;
};

export const isUserAlreadyJoined = async (id_experiment, id_user) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM UserExperience WHERE id_experiment = ? AND id_user = ?`,
    [id_experiment, id_user]
  );
  return rows.length > 0;
};

export const joinExperience = async (id_experiment, id_user) => {
  await pool.query(
    `INSERT INTO UserExperience (id_experiment, id_user)
     VALUES (?, ?)`,
    [id_experiment, id_user]
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
    INNER JOIN Experiment e ON r.id_experiment = e.id_experiment
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

export const isUserInExperience = async (id_user, id_experiment) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM UserExperience WHERE id_user = ? AND id_experiment = ?`,
    [id_user, id_experiment]
  );
  return rows.length > 0;
};

export const getExperimentStatus = async (id_experiment) => {
  const [rows] = await pool.query(
    `SELECT status FROM Experiment WHERE id_experiment = ?`,
    [id_experiment]
  );
  return rows[0];
};

export const getGroupInfo = async (id_group) => {
  const [rows] = await pool.query(
    `
    SELECT 
      g.id_group,
      g.capacity,
      COUNT(ug.id_user) AS members
    FROM \`Group\` g
    LEFT JOIN UserGroup ug ON g.id_group = ug.id_group
    WHERE g.id_group = ?
    GROUP BY g.id_group
    `,
    [id_group]
  );
  return rows[0];
};

export const removeUserFromGroups = async (id_user, id_experiment) => {
  await pool.query(
    `
    DELETE ug FROM UserGroup ug
    INNER JOIN \`Group\` g ON ug.id_group = g.id_group
    WHERE ug.id_user = ? AND g.id_experiment = ?
    `,
    [id_user, id_experiment]
  );
};

export const assignUserToGroup = async (id_user, id_group) => {
  await pool.query(
    `INSERT INTO UserGroup (id_user, id_group) VALUES (?, ?)`,
    [id_user, id_group]
  );
};

export const getAssignedDevice = async (id_user, id_experiment) => {
  const [rows] = await pool.query(
    `
    SELECT external_device_id
    FROM DeviceAssignment
    WHERE id_user = ? AND id_experiment = ?
    `,
    [id_user, id_experiment]
  );
  return rows[0];
};

export const setUserReady = async (id_user, id_experiment) => {
  await pool.query(
    `UPDATE UserExperience SET is_ready = true WHERE id_user = ? AND id_experiment = ?`,
    [id_user, id_experiment]
  );
};

export const getTeamsByExperimentRepository = async (experimentId) => {
  console.log('🔍 Repository: Buscando equipos para experimento ID:', experimentId);

  const [rows] = await pool.query(`
    SELECT
      g.id_group,
      g.name AS team_name,
      g.capacity,
      u.id_user,
      u.first_name,
      u.last_name,
      ue.is_ready
    FROM \`Group\` g
    LEFT JOIN UserGroup ug ON g.id_group = ug.id_group
    LEFT JOIN User u ON ug.id_user = u.id_user
    LEFT JOIN UserExperience ue ON (u.id_user = ue.id_user AND g.id_experiment = ue.id_experiment)
    WHERE g.id_experiment = ?
    ORDER BY g.id_group ASC, u.id_user ASC
  `, [experimentId]);

  console.log('📊 Filas obtenidas de la BD:', rows.length);
  if (rows.length > 0) {
    console.log('🗂️ Primera fila de ejemplo:', rows[0]);
  }

  const teamsMap = {};

  rows.forEach(row => {
    if (!teamsMap[row.id_group]) {
      teamsMap[row.id_group] = {
        id: row.id_group.toString(),
        name: row.team_name,
        maxMembers: row.capacity || 3,
        currentMembers: 0,
        members: []
      };
    }

    if (row.id_user) {
      teamsMap[row.id_group].currentMembers++;

      const firstName = row.first_name || 'Participante';
      const lastName = row.last_name || '';

      teamsMap[row.id_group].members.push({
        id: row.id_user.toString(),
        name: `${firstName} ${lastName}`.trim(),
        initials: `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`.toUpperCase(),
        isReady: row.is_ready === 1
      });
    }
  });

  const result = Object.values(teamsMap);
  console.log('✅ Equipos procesados:', result.length);
  console.log('📋 Equipos finales:', JSON.stringify(result, null, 2));

  return result;
};