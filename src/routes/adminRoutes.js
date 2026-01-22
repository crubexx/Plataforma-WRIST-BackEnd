import { Router } from 'express';
import { getAllUsers, createTeacher, deleteUser } from '../controllers/adminController.js';
import { authenticateToken, authorizeAdmin } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/adminMiddleware.js';

const router = Router();

// ADM-001: Ver todos los usuarios
router.get(
  '/users',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  getAllUsers
);

// ADM-002: Registrar docente
router.post(
  '/teachers',
  authenticateToken,
  authorizeAdmin,
  createTeacher
);

// ADM-003: Eliminar usuario
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeAdmin,
  deleteUser
);

export default router;