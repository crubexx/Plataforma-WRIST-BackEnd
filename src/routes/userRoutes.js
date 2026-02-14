import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getMyPerformance, getExperiencesByDate, joinExperience, getMyProfile, getMyResults, joinTeam } from '../controllers/userController.js';

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

// USR-004: Ver resultados de experiencias
router.get(
  '/results',
  authenticateToken,
  getMyResults
);

// USR-005: Unirse a un equipo
router.post(
  '/join-team',
  authenticateToken,
  joinTeam
);

// USR-006: Ver mi desempeño
router.get(
  '/performance/:id_experimento',
  authenticateToken,
  getMyPerformance
);


export default router;