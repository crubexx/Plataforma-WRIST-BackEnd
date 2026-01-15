import { loginUser, registerUser, recoverPassword, resetPassword } from '../services/authService.js';

// ACC-001: Iniciar Sesión
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Correo y contraseña son necesarios'
    });
  }

  try {
    const user = await loginUser(email, password);

    if (!user) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos'
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// ACC-002: Registro de Usuario
export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// ACC-003: Cerrar Sesión
export const logout = async (req, res) => {
  return res.status(200).json({
    message: 'Sesión cerrada correctamente'
  });
};

// ACC-004: Cambiar contraseña
export const recover = async (req, res) => {
  try {
    const result = await recoverPassword(req.body.email);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const reset = async (req, res) => {
  try {
    const result = await resetPassword(
      req.body.token,
      req.body.newPassword
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};