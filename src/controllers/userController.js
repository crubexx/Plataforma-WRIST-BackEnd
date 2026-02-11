import { getExperiencesByDateService, joinExperienceService } from '../services/userService.js';

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