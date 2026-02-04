import { Router } from 'express';
import {
  createExperience,
  getTeacherExperiences,
  getConnectedUsers,
  createGroup,
  assignDevice,
  startExperience,
  finishExperience,
  cancelExperience,
  getExperienceQuestions,
  getExperienceMetrics,
  getExperienceTeams
} from '../controllers/teacherController.js';
import {
  authenticateToken,
  authorizeTeacher
} from '../middlewares/authMiddleware.js';

const router = Router();

// DOE-001: Crear experiencia
router.post(
  '/experiences',
  authenticateToken,
  authorizeTeacher,
  createExperience
);

// DOE-002: Ver historial de experiencias del docente
router.get(
  '/experiences',
  authenticateToken,
  authorizeTeacher,
  getTeacherExperiences
);

// DOE-003: Ver usuarios conectados
router.get(
  '/connected-users',
  authenticateToken,
  authorizeTeacher,
  getConnectedUsers
);

// DOE-004: Crear equipos
router.post(
  '/groups',
  authenticateToken,
  authorizeTeacher,
  createGroup
);

// DOE-005: Agregar dispositivo
router.post(
  '/devices',
  authenticateToken,
  authorizeTeacher,
  assignDevice
);

// DOE-006: Mostrar experiencia (métricas)
router.get(
  '/experiences/:id/metrics',
  authenticateToken,
  authorizeTeacher,
  getExperienceMetrics
);

// DOE-007: Visualizar equipos de una experiencia
router.get(
  '/experiences/:id/teams',
  authenticateToken,
  authorizeTeacher,
  getExperienceTeams
);

// DOE-010: Iniciar experiencia
router.post(
  '/experiences/:id/start',
  authenticateToken,
  authorizeTeacher,
  startExperience
);

// DOE-011: Finalizar experiencia
router.post(
  '/experiences/:id/finish',
  authenticateToken,
  authorizeTeacher,
  finishExperience
);

// DOE-012: Obtener preguntas de una experiencia
router.get(
  '/experiences/:id/questions',
  authenticateToken,
  authorizeTeacher,
  getExperienceQuestions
);

// DOE-013: Cancelar experiencia
router.post(
  '/experiences/:id/cancel',
  authenticateToken,
  authorizeTeacher,
  cancelExperience
);

export default router;
