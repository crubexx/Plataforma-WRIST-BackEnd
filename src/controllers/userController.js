import { getExperiencesByDateService } from '../services/userService.js';

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