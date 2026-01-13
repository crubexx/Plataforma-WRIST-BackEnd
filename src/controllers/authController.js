import { loginUser, registerUser } from '../services/authService.js';

// ACC-001
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

// ACC-002
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
