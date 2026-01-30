import { createExperienceService, getTeacherExperiencesService, getConnectedUsersService } from '../services/teacherService.js';

// DOE-001: Crear experiencia
export const createExperience = async (req, res) => {
  try {
    const result = await createExperienceService(req.body, req.user);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// DOE-002: Ver historial de experiencias del docente
export const getTeacherExperiences = async (req, res) => {
  try {
    const teacherId = req.user.id_user;

    const experiences = await getTeacherExperiencesService(teacherId);

    return res.status(200).json(experiences);
  } catch (error) {
    console.error('Error DOE-002:', error);
    return res.status(500).json({
      message: 'Error al obtener historial de experiencias'
    });
  }
};

// DOE-003: Ver usuarios conectados
export const getConnectedUsers = async (req, res) => {
  try {
    const users = await getConnectedUsersService();

    if (users.length === 0) {
      return res.status(200).json({
        message: 'No hay usuarios conectados actualmente'
      });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error DOE-003:', error);
    return res.status(500).json({
      message: 'Error al obtener usuarios conectados'
    });
  }
};
