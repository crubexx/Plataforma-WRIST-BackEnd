import { Router } from 'express';
import { login, register, logout, recover, reset } from '../controllers/authController.js';

const router = Router();

// ACC-001: Iniciar Sesión
router.post('/login', login);

// ACC-002: Registro de Usuario
router.post('/register', register);

// ACC-003: Cerrar Sesión
router.post('/logout', logout);

// ACC-004: Cambiar contraseña
router.post('/recover-password', recover);
router.post('/reset-password', reset);

export default router;
