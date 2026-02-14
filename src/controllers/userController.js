import { getMyPerformanceService, getExperiencesByDateService, joinExperienceService, getUserProfileService, getUserResultsService, joinTeamService } from '../services/userService.js';

export const getExperiencesByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: 'Debe indicar una fecha'
      });
    }

    const result = await getExperiencesByDateService(date);
    return res.status(200).json(result);
  } catch (error) {
    console.error('USR-001 Error:', error);
    return res.status(500).json({
      message: 'Error al obtener experiencias'
    });
  }
};

export const joinExperience = async (req, res) => {
  try {
    const { id_experience, access_code } = req.body;
    const id_user = req.user.id_user;

    const result = await joinExperienceService(
      id_experience,
      access_code,
      id_user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-003: Ver perfil
export const getMyProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const profile = await getUserProfileService(id_user);

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-004: Ver resultados de mis experiencias
export const getMyResults = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const data = await getUserResultsService(id_user);

    if (data.message) {
      return res.status(200).json({ message: data.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('USR-004 error:', error);
    return res.status(500).json({
      message: 'Error al obtener resultados'
    });
  }
};

// USR-005: Unirse a un equipo
export const joinTeam = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experimento, id_group } = req.body;

    const result = await joinTeamService(
      id_user,
      id_experimento,
      id_group
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// USR-006: Ver mi desempeño
export const getMyPerformance = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { id_experimento } = req.params;

    const result = await getMyPerformanceService(
      id_user,
      id_experimento
    );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};