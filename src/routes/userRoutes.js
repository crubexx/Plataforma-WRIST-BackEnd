import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getExperiencesByDate, joinExperience, getMyProfile } from '../controllers/userController.js';

const router = Router();

// USR-001: Ver todas las experiencias
router.get(
  '/experiences',
  authenticateToken,
  getExperiencesByDate
);

// USR-002: Unirse a experiencia
router.post(
  '/experiences/join',
  authenticateToken,
  joinExperience
);

// USR-003: Ver perfil del usuario
router.get(
  '/profile',
  authenticateToken,
  getMyProfile
);


export default router;