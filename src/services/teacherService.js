import { createExperienceRepository } from '../repositories/teacherRepository.js';

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
