import {
  getExperiencesByDateRepository,
  findExperienceById,
  countParticipants,
  isUserAlreadyJoined,
  joinExperience,
  findUserProfileById,
  getUserAveragesRepository,
  getUserExperienceResultsRepository,
  isUserInExperience,
  getExperimentStatus,
  getGroupInfo,
  removeUserFromGroups,
  assignUserToGroup,
  getAssignedDevice,
  setUserReady,
  getTeamsByExperimentRepository,
  getExperienceQuestions,
  saveUserAnswer
} from '../repositories/userRepository.js'; import { pool } from '../config/database.js';

import { getUserFeedback } from '../repositories/feedbackRepository.js';
import { getTeamPerformance } from '../repositories/teamPerformanceRepository.js';
import { getUserPerformance } from '../repositories/userPerformanceRepository.js';

export const joinExperienceService = async (
  id_experiment,
  access_code,
  id_user
) => {
  const experience = await findExperienceById(id_experiment);

  if (!experience) {
    throw new Error('La experiencia no existe o ya no está disponible');
  }

  // 1️⃣ Estado: Permitir CREATED o EN_PREPARATION
  const allowedStatuses = ['CREATED', 'EN_PREPARATION'];
  if (!allowedStatuses.includes(experience.status)) {
    throw new Error('La experiencia no se encuentra en una etapa de ingreso de participantes');
  }

  // 2️⃣ Código - Validate against database field
  if (experience.access_code !== access_code) {
    throw new Error('El código de acceso ingresado es incorrecto');
  }

  // 3️⃣ Ya unido
  if (await isUserAlreadyJoined(id_experiment, id_user)) {
    throw new Error('Ya te encuentras inscrito en esta experiencia');
  }

  // 4️⃣ Capacidad
  const total = await countParticipants(id_experiment);
  if (total >= experience.max_participants) {
    throw new Error('La experiencia ya alcanzó el máximo de participantes permitidos');
  }

  // 5️⃣ Registrar participación
  await joinExperience(id_experiment, id_user);

  return {
    message: 'Te has unido a la experiencia correctamente',
    id_experiment: id_experiment
  };
};
export const getExperiencesByDateService = async (date, userId) => {
  const experiences = await getExperiencesByDateRepository(date, userId);

  // Return empty array if no experiences (frontend expects array)
  if (!experiences || !experiences.length) {
    return [];
  }

  return experiences.map(exp => ({
    id_experiment: exp.id_experiment,
    name: exp.name,
    description: exp.description,
    status: exp.status,
    start_date: exp.start_date,
    duration: exp.duration,
    participants: exp.participants_count,
    max_participants: exp.max_participants,
    can_enter_code: exp.status === 'EN_PREPARATION', // Fixed: was 'CREATED'
    is_joined: !!exp.is_joined
  }));
};

export const getUserProfileService = async (id_user) => {
  const user = await findUserProfileById(id_user);

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return {
    id_user: user.id_user,
    full_name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role,
    status: user.status,
    picture: user.picture, // puede ser null
    created_at: user.created_at
  };
};

export const getUserResultsService = async (id_user) => {
  const results = await getUserExperienceResultsRepository(id_user);

  if (!results || results.length === 0) {
    return {
      message: 'No existen resultados de experimentos para mostrar'
    };
  }

  const averages = await getUserAveragesRepository(id_user);

  return {
    averages: {
      productivity: averages.avg_productivity
        ? Number(averages.avg_productivity).toFixed(2)
        : null,
      stress: averages.avg_stress
        ? Number(averages.avg_stress).toFixed(2)
        : null
    },
    experiences: results.map(r => ({
      experience_name: r.experience_name,
      status: r.status,
      productivity_score: r.productivity_score,
      stress_level: r.stress_level,
      feedback: r.feedback,
      date: r.created_at
    }))
  };
};

export const joinTeamService = async (id_user, id_experiment, id_group) => {

  // 1️⃣ Usuario debe estar inscrito en la experiencia
  const enrolled = await isUserInExperience(id_user, id_experiment);
  if (!enrolled) {
    throw new Error('El usuario no está inscrito en la experiencia');
  }

  // 2️⃣ Experiencia debe estar en CREATED
  const exp = await getExperimentStatus(id_experiment);
  if (!exp || exp.status !== 'CREATED') {
    throw new Error('No es posible cambiar de equipo en esta etapa');
  }

  // 3️⃣ Capacidad del equipo
  const group = await getGroupInfo(id_group);
  if (!group) {
    throw new Error('Equipo no encontrado');
  }

  if (group.members >= group.capacity) {
    throw new Error('El equipo ha alcanzado su capacidad máxima');
  }

  // 4️⃣ Quitar de otros equipos (permite cambiar durante preparación)
  await removeUserFromGroups(id_user, id_experiment);

  // 5️⃣ Asignar al nuevo equipo
  await assignUserToGroup(id_user, id_group);

  // 6️⃣ Obtener dispositivo asignado (TEMPORALMENTE DESHABILITADO)
  // const device = await getAssignedDevice(id_user, id_experiment);

  return {
    message: 'Usuario asignado al equipo correctamente',
    device: 'Dispositivo aún no asignado (Simulado)' // device ? device.device_code : 'Dispositivo aún no asignado'
  };
};

// Performance

export const getMyPerformanceService = async (id_user, id_experiment) => {

  const data = await getUserPerformance(id_user, id_experiment);

  // 1️⃣ No hay datos
  if (!data) {
    throw new Error('La experiencia no ha sido iniciada');
  }

  // 2️⃣ Experiencia no iniciada
  if (data.status === 'CREATED') {
    throw new Error('La experiencia aún no ha sido iniciada');
  }

  // 3️⃣ Visualización bloqueada por docente
  if (!data.performance_visible) {
    return {
      blocked: true,
      message: 'Visualización desactivada por el docente'
    };
  }

  // 4️⃣ Mostrar desempeño
  return {
    blocked: false,
    performance: {
      total_time_seconds: data.total_time_seconds,
      stress_level: data.stress_level,
      productivity_level: data.productivity_level,
      work_phase_productivity: data.work_phase_productivity,
      restart_count: data.restart_count,
      started_at: data.start_date
    }
  };
};


export const getUserFeedbackService = async (id_user, id_experimento) => {

  // 1️⃣ Verificar estado del experimento
  const [exp] = await pool.query(
    `SELECT estado FROM Experimento WHERE id_experimento = ?`,
    [id_experimento]
  );

  if (!exp.length) {
    throw new Error('La experiencia no existe');
  }

  if (exp[0].estado !== 'IN_PROGRESS') {
    throw new Error('El feedback solo está disponible cuando la experiencia está en progreso');
  }

  // 2️⃣ Verificar que el usuario esté en un equipo
  const [teamCheck] = await pool.query(
    `
    SELECT 1 FROM GrupoUsuario gu
    INNER JOIN Grupo g ON gu.id_group = g.id_group
    WHERE gu.id_user = ? AND g.id_experimento = ?
    `,
    [id_user, id_experimento]
  );

  if (!teamCheck.length) {
    throw new Error('El usuario no pertenece a un equipo en esta experiencia');
  }

  const feedback = await getUserFeedback(id_user, id_experimento);

  return feedback;
};

export const getTeamPerformanceService = async (
  requesterRole,
  requesterId,
  id_experimento,
  id_group
) => {

  // 1️⃣ Validar experiencia
  const [exp] = await pool.query(
    `SELECT estado, performance_visible FROM Experimento WHERE id_experimento = ?`,
    [id_experimento]
  );

  if (!exp.length) {
    throw new Error('La experiencia no existe');
  }

  if (exp[0].estado === 'PREPARATION') {
    throw new Error('La experiencia aún no ha sido iniciada');
  }

  // 2️⃣ Si es usuario → validar que pertenezca al equipo
  if (requesterRole === 'USUARIO') {
    const [check] = await pool.query(
      `
      SELECT 1
      FROM UserGroup ug
      INNER JOIN Group g ON ug.id_group = g.id_group
      WHERE ug.id_user = ?
        AND ug.id_group = ?
        AND g.id_experiment = ?
      `,
      [requesterId, id_group, id_experimento]
    );

    if (!check.length) {
      throw new Error('No tiene acceso al desempeño de este equipo');
    }
  }

  // 3️⃣ Si visualización bloqueada
  if (!exp[0].performance_visible) {
    return {
      blocked: true,
      message: 'Visualización desactivada por el docente'
    };
  }

  // 4️⃣ Obtener métricas del equipo
  const performance = await getTeamPerformance(id_group, id_experimento);

  if (!performance || performance.total_time_seconds === null) {
    throw new Error('No hay datos disponibles para este equipo');
  }

  return {
    blocked: false,
    performance: {
      total_time_seconds: performance.total_time_seconds,
      avg_stress_level: performance.avg_stress_level,
      avg_productivity_level: performance.avg_productivity_level,
      avg_phase_productivity: performance.avg_phase_productivity,
      total_restarts: performance.total_restarts
    }
  };
};
// Lobby & Teams

export const getExperienceTeamsService = async (experimentId) => {
  return await getTeamsByExperimentRepository(experimentId);
};

export const setUserReadyService = async (id_user, id_experiment) => {
  await setUserReady(id_user, id_experiment);
  return { message: 'Estado actualizado a LISTO' };
};

export const getExperienceQuestionsService = async (experimentId, userId) => {
  // Verify that the user is joined to the experience
  const isJoined = await isUserInExperience(userId, experimentId);
  if (!isJoined) {
    throw new Error('No estás inscrito en esta experiencia');
  }

  return await getExperienceQuestions(experimentId);
};

export const saveUserAnswersService = async (experimentId, userId, answers) => {
  // Verify that the user is joined to the experience
  const isJoined = await isUserInExperience(userId, experimentId);
  if (!isJoined) {
    throw new Error('No estás inscrito en esta experiencia');
  }

  // Validate and save answers
  if (!Array.isArray(answers)) {
    throw new Error('El formato de las respuestas es inválido');
  }

  for (const answer of answers) {
    // answer should have id_question and either id_alternative or text_answer
    await saveUserAnswer(
      userId,
      experimentId,
      answer.id_question,
      answer.id_alternative || null,
      answer.text_answer || null
    );
  }

  return { message: 'Respuestas guardadas exitosamente' };
};
