import { Router } from 'express';
import { createExperience, getTeacherExperiences, getConnectedUsers, createGroup, assignDevice } from '../controllers/teacherController.js';
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

export default router;
