import { getExperiencesByDateRepository } from '../repositories/userRepository.js';

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