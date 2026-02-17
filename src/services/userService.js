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
  getUserFeedback
} from '../repositories/userRepository.js';

import { pool } from '../config/database.js';

import { getUserPerformance } from '../repositories/userPerformanceRepository.js';

export const joinExperienceService = async (
  id_experience,
  access_code,
  id_user
) => {
  const experience = await findExperienceById(id_experience);

  if (!experience) {
    throw new Error('La experiencia no existe');
  }

  // 1️⃣ Estado
  if (experience.status !== 'EN_PREPARATION') {
    throw new Error('La experiencia no está disponible para ingreso');
  }

  // 2️⃣ Código
  if (experience.access_code !== access_code) {
    throw new Error('El código ingresado es incorrecto');
  }

  // 3️⃣ Ya unido
  if (await isUserAlreadyJoined(id_experience, id_user)) {
    throw new Error('Ya te encuentras inscrito en esta experiencia');
  }

  // 4️⃣ Capacidad
  const total = await countParticipants(id_experience);
  if (total >= experience.max_participants) {
    throw new Error('La experiencia ya alcanzó el máximo de participantes');
  }

  // 5️⃣ Registrar participación
  await joinExperience(id_experience, id_user);

  return {
    message: 'Te has unido a la experiencia correctamente'
  };
};
export const getExperiencesByDateService = async (date) => {
  const experiences = await getExperiencesByDateRepository(date);

  if (!experiences.length) {
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
    can_enter_code: exp.status === 'PREPARATION'
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
      status: r.estado,
      productivity_score: r.productivity_score,
      stress_level: r.stress_level,
      feedback: r.feedback,
      date: r.created_at
    }))
  };
};

export const joinTeamService = async (id_user, id_experimento, id_group) => {

  // 1️⃣ Usuario debe estar inscrito en la experiencia
  const enrolled = await isUserInExperience(id_user, id_experimento);
  if (!enrolled) {
    throw new Error('El usuario no está inscrito en la experiencia');
  }

  // 2️⃣ Experiencia debe estar en PREPARATION
  const exp = await getExperimentStatus(id_experimento);
  if (!exp || exp.estado !== 'PREPARATION') {
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
  await removeUserFromGroups(id_user, id_experimento);

  // 5️⃣ Asignar al nuevo equipo
  await assignUserToGroup(id_user, id_group);

  // 6️⃣ Obtener dispositivo asignado
  const device = await getAssignedDevice(id_user, id_experimento);

  return {
    message: 'Usuario asignado al equipo correctamente',
    device: device ? device.device_code : 'Dispositivo aún no asignado'
  };
};

// Performance

export const getMyPerformanceService = async (id_user, id_experimento) => {

  const data = await getUserPerformance(id_user, id_experimento);

  // 1️⃣ No hay datos
  if (!data) {
    throw new Error('La experiencia no ha sido iniciada');
  }

  // 2️⃣ Experiencia no iniciada
  if (data.estado === 'PREPARATION') {
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
      restart_count: data.restart_count
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