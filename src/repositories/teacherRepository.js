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

// DOE-006: Iniciar experiencia
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

// DOE-007: Finalizar experiencia
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

// DOE-009: Cancelar experiencia
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

// DOE-008: Obtener preguntas de una experiencia
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