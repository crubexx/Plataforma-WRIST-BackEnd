import { Router } from 'express';
import { login, register } from '../controllers/authController.js';

const router = Router();

// ACC-001
router.post('/login', login);
// ACC-002
router.post('/register', register);

export default router;
