import {
  getAllUsersService, deleteUserService,
  createTeacherService, editUserService,
  getAllExperiencesService
} from '../services/adminService.js';

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

// ADM-002: Registrar docente
export const createTeacher = async (req, res) => {
  try {
    const result = await createTeacherService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// ADM-003: Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteUserService(
      Number(id),
      req.user
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
};

// ADM-004 / ADM-005: Editar usuario y estado
export const editUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const admin = req.user; // viene del token
    const result = await editUserService(userId, req.body, admin);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// ADM-006: Historial de experiencias
export const getAllExperiences = async (req, res) => {
  try {
    const experiences = await getAllExperiencesService();
    return res.status(200).json(experiences);
  } catch (error) {
    console.error('Error ADM-006:', error);
    return res.status(500).json({
      message: 'Error al obtener historial de experiencias'
    });
  }
};