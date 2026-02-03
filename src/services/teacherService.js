import {
  createExperienceRepository,
  getTeacherExperiencesRepository,
  getConnectedUsersRepository,
  findExperimentByIdAndTeacher,
  createGroupRepository,
  startExperienceRepository,
  finishExperienceRepository,
  cancelExperienceRepository,
  getExperienceQuestionsRepository
} from '../repositories/teacherRepository.js';
import { createDeviceAssignment } from '../repositories/deviceRepository.js';

export const createExperienceService = async (data, user) => {
  const { name, description, duration, questions } = data;

  // Validaciones básicas
  if (!name) throw new Error('Falta completar el campo Nombre');
  if (!description) throw new Error('Falta completar el campo Descripción');

  if (name.length < 3) {
    throw new Error('El nombre de la experiencia debe tener al menos 3 caracteres');
  }

  // Validar preguntas si existen
  if (questions && questions.length > 0) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.question || q.question.trim() === '') {
        throw new Error(`La pregunta ${i + 1} no puede estar vacía`);
      }

      if (!q.alternatives || q.alternatives.length < 2) {
        throw new Error(`La pregunta ${i + 1} debe tener al menos 2 alternativas`);
      }

      // Validar que las alternativas no estén vacías
      for (let j = 0; j < q.alternatives.length; j++) {
        if (!q.alternatives[j] || q.alternatives[j].trim() === '') {
          throw new Error(`La alternativa ${j + 1} de la pregunta ${i + 1} no puede estar vacía`);
        }
      }
    }
  }

  const experienceId = await createExperienceRepository({
    name,
    description,
    duration,
    user_id: user.id_user,
    questions
  });

  return {
    message: 'Experiencia creada correctamente',
    experienceId
  };
};

// DOE-002: Ver historial de experiencias del docente
export const getTeacherExperiencesService = async (teacherId) => {
  return await getTeacherExperiencesRepository(teacherId);
};

// DOE-003: Ver usuarios conectados
export const getConnectedUsersService = async () => {
  return await getConnectedUsersRepository();
};

// DOE-004: Crear equipos
export const createGroupService = async (teacherId, data) => {
  const { name, id_experiment } = data;

  if (!name) {
    throw new Error('Falta completar el campo Nombre del equipo');
  }

  if (!id_experiment) {
    throw new Error('Falta seleccionar la experiencia');
  }

  // Validar experiencia del docente
  const experiment = await findExperimentByIdAndTeacher(
    id_experiment,
    teacherId
  );

  if (!experiment) {
    throw new Error(
      'La experiencia no existe o no pertenece al docente'
    );
  }

  const groupId = await createGroupRepository({
    name,
    id_experiment
  });

  return {
    message: 'Equipo creado correctamente',
    groupId
  };
};

// DOC-005
export const assignDeviceService = async (teacherId, data) => {
  const {
    external_device_id,
    device_type,
    id_experiment,
    id_group,
    id_user
  } = data;

  // 1️⃣ Validaciones básicas
  if (!external_device_id || !device_type) {
    throw new Error('Faltan datos del dispositivo');
  }

  // 2️⃣ Solo un destino
  const targets = [id_experiment, id_group, id_user].filter(Boolean);
  if (targets.length !== 1) {
    throw new Error(
      'El dispositivo debe asignarse a una experiencia, equipo o usuario'
    );
  }

  // 3️⃣ Si es experiencia, validar que sea del docente
  if (id_experiment) {
    const exp = await findExperimentByIdAndTeacher(id_experiment, teacherId);
    if (!exp || exp.created_by !== teacherId) {
      throw new Error('La experiencia no pertenece al docente');
    }
  }

  await createDeviceAssignment(data);

  return {
    message: 'Dispositivo agregado correctamente'
  };
};

// DOE-006: Iniciar experiencia
export const startExperienceService = async (experimentId, teacherId) => {
  // Verificar que la experiencia pertenece al docente
  const experiment = await findExperimentByIdAndTeacher(experimentId, teacherId);

  if (!experiment) {
    throw new Error('Experiencia no encontrada o no tienes permisos para iniciarla');
  }

  // Validar que la experiencia esté en estado CREATED
  if (experiment.status !== 'CREATED') {
    throw new Error(`No se puede iniciar una experiencia en estado ${experiment.status}. Solo se pueden iniciar experiencias en estado CREATED.`);
  }

  const updated = await startExperienceRepository(experimentId);

  if (!updated) {
    throw new Error('No se pudo iniciar la experiencia');
  }

  return {
    message: 'Experiencia iniciada correctamente'
  };
};

// DOE-007: Finalizar experiencia
export const finishExperienceService = async (experimentId, teacherId) => {
  // Verificar que la experiencia pertenece al docente
  const experiment = await findExperimentByIdAndTeacher(experimentId, teacherId);

  if (!experiment) {
    throw new Error('Experiencia no encontrada o no tienes permisos para finalizarla');
  }

  // Validar que la experiencia esté ACTIVE
  if (experiment.status !== 'ACTIVE') {
    throw new Error(`No se puede finalizar una experiencia en estado ${experiment.status}. Solo se pueden finalizar experiencias ACTIVAS.`);
  }

  const updated = await finishExperienceRepository(experimentId);

  if (!updated) {
    throw new Error('No se pudo finalizar la experiencia');
  }

  return {
    message: 'Experiencia finalizada correctamente'
  };
};

// DOE-008: Obtener preguntas de una experiencia
export const getExperienceQuestionsService = async (experimentId, teacherId) => {
  // Verificar que la experiencia pertenece al docente
  const experiment = await findExperimentByIdAndTeacher(experimentId, teacherId);

  if (!experiment) {
    throw new Error('Experiencia no encontrada o no tienes permisos para ver sus preguntas');
  }

  const questions = await getExperienceQuestionsRepository(experimentId);

  return questions;
};

// DOE-009: Cancelar experiencia
export const cancelExperienceService = async (experimentId, teacherId) => {
  // Verificar que la experiencia pertenece al docente
  const experiment = await findExperimentByIdAndTeacher(experimentId, teacherId);

  if (!experiment) {
    throw new Error('Experiencia no encontrada o no tienes permisos para cancelarla');
  }

  // Validar que la experiencia no esté ya finalizada o cancelada
  if (experiment.status === 'COMPLETED' || experiment.status === 'CANCELLED') {
    throw new Error(`No se puede cancelar una experiencia que ya está ${experiment.status === 'COMPLETED' ? 'finalizada' : 'cancelada'}.`);
  }

  const updated = await cancelExperienceRepository(experimentId);

  if (!updated) {
    throw new Error('No se pudo cancelar la experiencia');
  }

  return {
    message: 'Experiencia cancelada correctamente'
  };
};