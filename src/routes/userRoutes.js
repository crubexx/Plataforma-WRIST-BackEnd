import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getExperiencesByDate } from '../controllers/userController.js';

const router = Router();

// USR-001: Ver todas las experiencias
router.get(
  '/experiences',
  authenticateToken,
  getExperiencesByDate
);

export default router;