import { createExperienceRepository, getTeacherExperiencesRepository, getConnectedUsersRepository, findExperimentByIdAndTeacher, createGroupRepository } from '../repositories/teacherRepository.js';

export const createExperienceService = async (data, user) => {
  const { name, description } = data;

  // Validaciones
  if (!name) throw new Error('Falta completar el campo Nombre');
  if (!description) throw new Error('Falta completar el campo Descripción');

  if (name.length < 3) {
    throw new Error('El nombre de la experiencia debe tener al menos 3 caracteres');
  }

  const experienceId = await createExperienceRepository({
    name,
    description,
    user_id: user.id_user
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