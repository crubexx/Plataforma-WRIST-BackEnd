import jwt from 'jsonwebtoken';

/**
 * Verifica JWT
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id_user, email, role
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

/**
 * Solo ADMIN o SUPERADMIN
 */
export const authorizeAdmin = (req, res, next) => {
  const role = req.user.role;

  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return res.status(403).json({
      message: 'Acceso denegado: solo administradores'
    });
  }

  next();
};

export const authorizeSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({
        message: 'Acceso denegado: solo SuperAdmin'
      });
    }
    next();
  };
