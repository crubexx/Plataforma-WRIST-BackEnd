import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/adminMiddleware.js';

const router = Router();

// ADM-001: Ver todos los usuarios
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  getAllUsers
);

export default router;