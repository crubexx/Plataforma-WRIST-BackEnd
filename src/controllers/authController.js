import { loginUser, registerUser, recoverPassword, resetPassword, logoutUserService, completeGoogleRegistration } from '../services/authService.js';
import { authenticateWithGoogle } from '../services/googleAuthService.js';


// ACC-001: Iniciar Sesión
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Correo y contraseña son necesarios'
    });
  }

  try {
    const result = await loginUser(email, password);

    if (!result) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos'
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error.message);

    if (error.message.includes('cuenta no se encuentra activa')) {
      return res.status(403).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
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
  try {
    await logoutUserService(req.user.id_user);

    return res.status(200).json({
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error('Error logout:', error);
    return res.status(500).json({
      message: 'Error al cerrar sesión'
    });
  }
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

// ACC-005: Autenticación con Google
export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      message: 'Token de Google no proporcionado'
    });
  }

  try {
    const result = await authenticateWithGoogle(idToken);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error en Google Auth:', error.message);

    if (error.message.includes('Token used too late')) {
      return res.status(401).json({
        message: 'Token de Google expirado'
      });
    }

    if (error.message.includes('no está verificado')) {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: 'Error al autenticar con Google'
    });
  }
};

export const completeGoogleProfile = async (req, res) => {
  try {
    const id_user = req.user.id_user;

    const { rut, gender, date_of_birth } = req.body;

    const result = await completeGoogleRegistration(
      id_user,
      rut,
      gender,
      date_of_birth
    );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

