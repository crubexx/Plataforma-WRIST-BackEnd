import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getUserFeedback, getTeamPerformance, getMyPerformance, getExperiencesByDate, joinExperience, getMyProfile, getMyResults, joinTeam, getExperienceTeams, setReady, getExperienceQuestions, submitExperienceAnswers } from '../controllers/userController.js';

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

// USR-007: Feedback
router.get(
  '/feedback/:id_experimento',
  authenticateToken,
  getUserFeedback
);

// USR-008: 
router.get(
  '/team-performance/:id_experimento/:id_group',
  authenticateToken,
  getTeamPerformance
);

// USR-007: Ver equipos de una experiencia
router.get(
  '/experiences/:id_experiment/teams',
  authenticateToken,
  getExperienceTeams
);

// USR-008: Marcar como listo
router.post(
  '/set-ready',
  authenticateToken,
  setReady
);

// USR-009: Obtener preguntas
router.get(
  '/experiences/:id_experiment/questions',
  authenticateToken,
  getExperienceQuestions
);

// USR-010: Guardar respuestas
router.post(
  '/experiences/:id_experiment/answers',
  authenticateToken,
  submitExperienceAnswers
);

export default router;