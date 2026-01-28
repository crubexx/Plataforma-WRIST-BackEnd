import { createExperienceService } from '../services/teacherService.js';

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
