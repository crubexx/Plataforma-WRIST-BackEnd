import { Router } from 'express';
import { createExperience } from '../controllers/teacherController.js';
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

export default router;
