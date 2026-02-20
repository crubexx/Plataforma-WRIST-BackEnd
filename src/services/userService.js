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
} from '../repositories/userRepository.js';

import { pool } from '../config/database.js';

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

  // Estado: Permitir CREATED o EN_PREPARATION
  const allowedStatuses = ['CREATED', 'EN_PREPARATION'];
  if (!allowedStatuses.includes(experience.status)) {
    throw new Error('La experiencia no se encuentra en una etapa de ingreso de participantes');
  }

  // Código - Validate against database field
  if (experience.access_code !== access_code) {
    throw new Error('El código de acceso ingresado es incorrecto');
  }

  // Ya unido
  if (await isUserAlreadyJoined(id_experiment, id_user)) {
    throw new Error('Ya te encuentras inscrito en esta experiencia');
  }

  // Capacidad
  const total = await countParticipants(id_experiment);
  if (total >= experience.max_participants) {
    throw new Error('La experiencia ya alcanzó el máximo de participantes permitidos');
  }

  // Registrar participación
  await joinExperience(id_experiment, id_user);

  return {
    message: 'Te has unido a la experiencia correctamente',
    id_experiment: id_experiment
  };
};
export const getExperiencesByDateService = async (date) => {
  const experiences = await getExperiencesByDateRepository(date);

  // Error
  if (!experiences || !experiences.length) {
    return {
      message: 'No se han realizado experimentos para el día seleccionado'
    };
  }

  return experiences.map(exp => ({
    id_experiment: exp.id_experiment,
    name: exp.name,
    status: exp.status,
    participants: exp.participants_count,
    max_participants: exp.max_participants,
    can_enter_code: exp.status === 'EN_PREPARATION' // Fixed: was 'CREATED'
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

  // Usuario debe estar inscrito en la experiencia
  const enrolled = await isUserInExperience(id_user, id_experiment);
  if (!enrolled) {
    throw new Error('El usuario no está inscrito en la experiencia');
  }

  // Experiencia debe estar en CREATED o EN_PREPARATION
  const exp = await getExperimentStatus(id_experiment);
  if (!exp || !['CREATED','EN_PREPARATION'].includes(exp.status)) {
    throw new Error('No es posible cambiar de equipo en esta etapa');
  }

  // Capacidad del equipo
  const group = await getGroupInfo(id_group);
  if (!group) {
    throw new Error('Equipo no encontrado');
  }

  if (group.members >= group.capacity) {
    throw new Error('El equipo ha alcanzado su capacidad máxima');
  }

  // Quitar de otros equipos (permite cambiar durante preparación)
  await removeUserFromGroups(id_user, id_experiment);

  // Asignar al nuevo equipo
  await assignUserToGroup(id_user, id_group);

  // Obtener dispositivo asignado
  const device = await getAssignedDevice(id_user, id_experiment);

  return {
    message: 'Usuario asignado al equipo correctamente',
    device: device ? device.external_device_id : 'Dispositivo aún no asignado'
  };
};

// Performance

export const getMyPerformanceService = async (id_user, id_experiment) => {

  const data = await getUserPerformance(id_user, id_experiment);

  // No hay datos
if (!data || data.status === 'CREATED' || data.status === 'EN_PREPARATION') {
  return {
    blocked: true,
    message: 'La experiencia aún no ha sido iniciada'
  };
}

  // Visualización bloqueada por docente
  if (!data.performance_visible) {
    return {
      blocked: true,
      message: 'Visualización desactivada por el docente'
    };
  }

  // Mostrar desempeño
  return {
    blocked: false,
    performance: {
      total_time_seconds: data.total_time_seconds,
      stress_level: data.stress_level,
      productivity_level: data.productivity_level,
      work_phase_productivity: data.work_phase_productivity,
      restart_count: data.restart_count
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

export const getUserFeedbackService = async (id_user, id_experiment) => {

  // Verificar estado del experimento
  const [exp] = await pool.query(
    `SELECT status FROM Experiment WHERE id_experiment = ?`,
    [id_experiment]
  );

  if (!exp.length) {
    throw new Error('La experiencia no existe');
  }

  if (exp[0].status !== 'ACTIVE') {
    throw new Error('El feedback solo está disponible cuando la experiencia está en progreso');
  }

  // Verificar que el usuario esté en un equipo
  const [teamCheck] = await pool.query(
    `
    SELECT 1 FROM UserGroup gu
    INNER JOIN Group g ON gu.id_group = g.id_group
    WHERE gu.id_user = ? AND g.id_experiment = ?
    `,
    [id_user, id_experiment]
  );

  if (!teamCheck.length) {
    throw new Error('El usuario no pertenece a un equipo en esta experiencia');
  }

  const feedback = await getUserFeedback(id_user, id_experiment);

  return feedback;
};

export const getTeamPerformanceService = async (
  requesterRole,
  requesterId,
  id_experiment,
  id_group
) => {

  // Validar experiencia
  const [exp] = await pool.query(
    `SELECT status, performance_visible FROM Experiment WHERE id_experiment = ?`,
    [id_experiment]
  );

  if (!exp.length) {
    throw new Error('La experiencia no existe');
  }

  if (exp[0].status === 'CREATED' || exp[0].status === 'EN_PREPARATION') {
  return {
    blocked: true,
    message: 'La experiencia aún no ha sido iniciada'
  };
}

  // Si es usuario → validar que pertenezca al equipo
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
      [requesterId, id_group, id_experiment]
    );

    if (!check.length) {
      throw new Error('No tiene acceso al desempeño de este equipo');
    }
  }

  // Si visualización bloqueada
  if (!exp[0].performance_visible) {
    return {
      blocked: true,
      message: 'Visualización desactivada por el docente'
    };
  }

  // Obtener métricas del equipo
  const performance = await getTeamPerformance(id_group, id_experiment);

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
