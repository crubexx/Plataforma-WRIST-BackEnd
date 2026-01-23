import { Router } from 'express';
import { getAllUsers, createTeacher, deleteUser, editUser } from '../controllers/adminController.js';
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

// ADM-004 / ADM-005: Editar usuario y estado
router.put(
  '/users/:id',
  authenticateToken,
  authorizeAdmin,
  editUser
);

export default router;