import { pool } from '../config/database.js';

export const createExperienceRepository = async ({
  name,
  description,
  duration,
  user_id,
  questions
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insertar experiencia
    const [result] = await connection.query(
      `
      INSERT INTO Experiment
        (name, description, duration, status, created_by, created_at)
      VALUES
        (?, ?, ?, 'CREATED', ?, NOW())
      `,
      [name, description, duration || null, user_id]
    );

    const experimentId = result.insertId;

    // 2. Insertar preguntas si existen
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];

        // Insertar pregunta
        const [questionResult] = await connection.query(
          `
          INSERT INTO Question
            (id_experiment, question_text, question_order)
          VALUES
            (?, ?, ?)
          `,
          [experimentId, question.question, i + 1]
        );

        const questionId = questionResult.insertId;

        // Insertar alternativas
        if (question.alternatives && question.alternatives.length > 0) {
          for (let j = 0; j < question.alternatives.length; j++) {
            await connection.query(
              `
              INSERT INTO QuestionAlternative
                (id_question, alternative_text, alternative_order)
              VALUES
                (?, ?, ?)
              `,
              [questionId, question.alternatives[j], j + 1]
            );
          }
        }
      }
    }

    await connection.commit();
    return experimentId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// DOE-002: Obtener experiencias del docente logueado
export const getTeacherExperiencesRepository = async (teacherId) => {
  const [rows] = await pool.query(
    `
    SELECT
      id_experiment,
      name,
      description,
      status,
      created_by,
      created_at
    FROM Experiment
    WHERE created_by = ?
    ORDER BY created_at DESC
    `,
    [teacherId]
  );

  return rows;
};

// DOE-003: Usuarios conectados actualmente
export const getConnectedUsersRepository = async () => {
  const [rows] = await pool.query(`
    SELECT DISTINCT
      u.first_name,
      u.last_name
    FROM UserSession s
    INNER JOIN User u ON u.id_user = s.id_user
    WHERE s.is_active = TRUE
      AND u.role = 'USUARIO'
  `);

  return rows;
};

// DOE-004: Crear equipos
// Validar experiencia del docente
export const findExperimentByIdAndTeacher = async (
  experimentId,
  teacherId
) => {
  const [rows] = await pool.query(
    `
    SELECT id_experiment, status
    FROM Experiment
    WHERE id_experiment = ?
      AND created_by = ?
    `,
    [experimentId, teacherId]
  );

  return rows[0];
};

// Crear equipo
export const createGroupRepository = async ({ name, id_experiment }) => {
  const [result] = await pool.query(
    `
    INSERT INTO \`Group\` (name, is_active, id_experiment)
    VALUES (?, true, ?)
    `,
    [name, id_experiment]
  );

  return result.insertId;
};

// DOE-006: Métricas de la experiencia
export const getExperienceMetricsRepository = async (experimentId) => {
  const [rows] = await pool.query(`
    SELECT
      sm.id_session_measurement,
      g.name AS station,
      sm.start_ts,
      sm.end_ts,
      TIMESTAMPDIFF(SECOND, sm.start_ts, sm.end_ts) AS duration_seconds,
      sm.status,
      sm.session_id_iot
    FROM SessionMeasurement sm
    INNER JOIN \`Group\` g ON sm.id_group = g.id_group
    WHERE g.id_experiment = ?
    ORDER BY sm.start_ts ASC
  `, [experimentId]);

  return rows.map(row => ({
    station: row.station,
    start_time: row.start_ts,
    end_time: row.end_ts,
    duration_seconds: row.duration_seconds,
    status: row.status,
    heart_rate: null, // ← vendrá del sistema IoT
    session_iot: row.session_id_iot
  }));
};

// DOE-007: Obtener equipos de una experiencia
export const getTeamsByExperimentRepository = async (experimentId) => {
  const [rows] = await pool.query(`
    SELECT
      g.id_group,
      g.name AS team_name,
      u.id_user,
      CONCAT(u.first_name, ' ', u.last_name) AS member_name
    FROM \`Group\` g
    LEFT JOIN UserGroup ug ON g.id_group = ug.id_group
    LEFT JOIN User u ON ug.id_user = u.id_user
    WHERE g.id_experiment = ?
    ORDER BY g.id_group ASC
  `, [experimentId]);

  // Agrupar por equipo
  const teamsMap = {};

  rows.forEach(row => {
    if (!teamsMap[row.id_group]) {
      teamsMap[row.id_group] = {
        team: row.team_name,
        members: []
      };
    }

    if (row.member_name) {
      teamsMap[row.id_group].members.push(row.member_name);
    }
  });

  // Formato final
  return Object.values(teamsMap).map(team => ({
    team: team.team,
    total_members: team.members.length,
    members: team.members
  }));
};

// DOE-010: Iniciar experiencia
export const startExperienceRepository = async (experimentId) => {
  const [result] = await pool.query(
    `
    UPDATE Experiment
    SET status = 'ACTIVE',
        start_date = NOW()
    WHERE id_experiment = ?
    `,
    [experimentId]
  );

  return result.affectedRows > 0;
};

// DOE-011: Finalizar experiencia
export const finishExperienceRepository = async (experimentId) => {
  const [result] = await pool.query(
    `
    UPDATE Experiment
    SET status = 'COMPLETED',
        end_date = NOW()
    WHERE id_experiment = ?
    `,
    [experimentId]
  );

  return result.affectedRows > 0;
};

// DOE-012: Cancelar experiencia
export const cancelExperienceRepository = async (experimentId) => {
  const [result] = await pool.query(
    `
    UPDATE Experiment
    SET status = 'CANCELLED',
        end_date = NOW()
    WHERE id_experiment = ?
    `,
    [experimentId]
  );

  return result.affectedRows > 0;
};

// DOE-013: Obtener preguntas de una experiencia
export const getExperienceQuestionsRepository = async (experimentId) => {
  // Obtener preguntas
  const [questions] = await pool.query(
    `
    SELECT
      id_question,
      question_text,
      question_order
    FROM Question
    WHERE id_experiment = ?
    ORDER BY question_order ASC
    `,
    [experimentId]
  );

  // Para cada pregunta, obtener sus alternativas
  for (const question of questions) {
    const [alternatives] = await pool.query(
      `
      SELECT
        alternative_text,
        alternative_order
      FROM QuestionAlternative
      WHERE id_question = ?
      ORDER BY alternative_order ASC
      `,
      [question.id_question]
    );

    question.alternatives = alternatives.map(alt => alt.alternative_text);
  }

  return questions;
};