import { getAllUsersService } from '../services/adminService.js';

// ADM-001: Ver todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error ADM-001:', error);
    return res.status(500).json({
      message: 'Error al obtener usuarios'
    });
  }
};
