import { 
  getExperiencesByDateRepository, 
  findExperienceById,
  countParticipants,
  isUserAlreadyJoined,
  joinExperience,
  findUserProfileById
} from '../repositories/userRepository.js';

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