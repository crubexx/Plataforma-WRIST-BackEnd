import { Router } from 'express';
import { createExperience, getTeacherExperiences } from '../controllers/teacherController.js';
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

export default router;
