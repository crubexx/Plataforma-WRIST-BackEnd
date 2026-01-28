import {
  getAllUsersRepository,
  deleteUserRepository, findUserByIdAdmin,
  updateUserRepository, findUserById,
  getAllExperiencesRepository,
  getSuspendedUsersRepository
} from '../repositories/adminRepository.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  findUserByRut,
  findUserByEmail,
  createUser
} from '../repositories/authRepository.js';
import { sendTeacherWelcomeEmail, sendAdminWelcomeEmail } from '../utils/mailService.js';
import { isValidRut } from '../utils/rutValidator.js';

// ADM-001: Ver todos los usuarios
export const getAllUsersService = async () => {
  return await getAllUsersRepository();
};

// ADM-002: Registrar docente
export const createTeacherService = async (data) => {
  const {
    first_name,
    last_name,
    rut,
    email,
    gender,
    date_of_birth
  } = data;

  // Campos obligatorios
  if (!first_name) throw new Error('Falta completar el campo Nombre');
  if (!last_name) throw new Error('Falta completar el campo Apellidos');
  if (!rut) throw new Error('Falta completar el campo RUT');
  if (!email) throw new Error('Falta completar el campo Correo electrónico');
  if (!gender) throw new Error('Falta completar el campo Género');
  if (!date_of_birth) throw new Error('Falta completar el campo Edad');

  // Validaciones nombre
  if (first_name.length < 2 || last_name.length < 2) {
    throw new Error('El nombre y apellidos deben tener al menos 2 caracteres');
  }

  // Validación RUT formato
  const rutRegex = /^\d{7,8}[0-9Kk]$/;
  if (!rutRegex.test(rut)) {
    throw new Error('El RUT debe ingresarse sin puntos ni guión (ej.: 12456789K)');
  }

  if (!isValidRut(rut)) {
    throw new Error('El RUT ingresado no es válido');
  }

  // RUT único
  if (await findUserByRut(rut)) {
    throw new Error('El RUT ingresado ya se encuentra registrado');
  }

  // Email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El correo electrónico no tiene un formato válido');
  }

  if (await findUserByEmail(email)) {
    throw new Error('El correo electrónico ya se encuentra registrado');
  }

  // Generar contraseña automática
  const plainPassword = crypto.randomBytes(6).toString('base64') + '!';
  const password_hash = await bcrypt.hash(plainPassword, 10);

  // Crear usuario DOCENTE
  const userId = await createUser({
    first_name,
    last_name,
    rut,
    email,
    password_hash,
    role: 'DOCENTE',
    gender,
    date_of_birth
  });

  // Enviar correo con credenciales
  await sendTeacherWelcomeEmail(
    email,
    `${first_name} ${last_name}`,
    plainPassword
  );

  return {
    message: 'Docente registrado correctamente',
    userId
  };
};

// ADM-003: Eliminar usuario
export const deleteUserService = async (targetUserId, currentUser) => {
  // Usuario existe
  const user = await findUserByIdAdmin(targetUserId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Ya eliminado
  if (user.status === 'SUSPENDED') {
    throw new Error('El usuario ya se encuentra eliminado');
  }

  // No eliminarse a sí mismo
  if (user.id_user === currentUser.id_user) {
    throw new Error('No puedes eliminar tu propia cuenta');
  }

  // Reglas por rol
  if (currentUser.role === 'ADMIN') {
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      throw new Error('No tienes permisos para eliminar este usuario');
    }
  }

  // Ejecutar eliminación lógica
  const affected = await deleteUserRepository(targetUserId);

  if (!affected) {
    throw new Error('No fue posible eliminar el usuario');
  }

  return { message: 'Usuario eliminado correctamente' };
};

// ADM-004 / ADM-005: Editar usuario y estado
export const editUserService = async (userId, data, admin) => {
  const {
    first_name,
    last_name,
    email,
    role,
    status,
    rut,
    gender,
    date_of_birth
  } = data;

  const user = await findUserById(userId);

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // No se edita SUPERADMIN
  if (user.role === 'SUPERADMIN') {
    throw new Error('No se puede editar un SuperAdmin');
  }

  // Admin no puede editar a otro admin
  if (
    admin.role === 'ADMIN' &&
    user.role === 'ADMIN' &&
    Number(userId) !== Number(admin.id_user)
  ) {
    throw new Error('No tienes permisos para editar a otro administrador');
  }

  // Validaciones
  if (first_name && first_name.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres');
  }

  if (last_name && last_name.length < 2) {
    throw new Error('El apellido debe tener al menos 2 caracteres');
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('El correo electrónico no tiene un formato válido');
    }
  }

  if (rut) {
    const rutRegex = /^\d{7,8}[0-9Kk]$/;
    if (!rutRegex.test(rut)) {
      throw new Error('El RUT debe ingresarse sin puntos ni guión (ej.: 12456789K)');
    }
    if (!isValidRut(rut)) {
      throw new Error('El RUT ingresado no es válido');
    }
  }

  const validRoles = ['USUARIO', 'DOCENTE', 'ADMIN'];
  if (role && !validRoles.includes(role)) {
    throw new Error('Rol no válido');
  }

  const validStatus = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  if (status && !validStatus.includes(status)) {
    throw new Error('Estado no válido');
  }

  await updateUserRepository(userId, {
    first_name,
    last_name,
    email,
    role,
    status,
    rut,
    gender,
    date_of_birth
  });

  return { message: 'Usuario actualizado correctamente' };
};

// ADM-006
export const getAllExperiencesService = async () => {
  return await getAllExperiencesRepository();
};

// ADM-007: Crear ADMIN
export const createAdminService = async (data) => {
  const {
    first_name,
    last_name,
    rut,
    email,
    gender,
    date_of_birth
  } = data;

  // Campos obligatorios
  if (!first_name) throw new Error('Falta completar el campo Nombre');
  if (!last_name) throw new Error('Falta completar el campo Apellidos');
  if (!rut) throw new Error('Falta completar el campo RUT');
  if (!email) throw new Error('Falta completar el campo Correo electrónico');
  if (!gender) throw new Error('Falta completar el campo Género');
  if (!date_of_birth) throw new Error('Falta completar el campo Edad');

  // Validaciones nombre
  if (first_name.length < 2 || last_name.length < 2) {
    throw new Error('El nombre y apellidos deben tener al menos 2 caracteres');
  }

  // Validación RUT formato
  const rutRegex = /^\d{7,8}[0-9Kk]$/;
  if (!rutRegex.test(rut)) {
    throw new Error('El RUT debe ingresarse sin puntos ni guión (ej.: 12456789K)');
  }

  if (!isValidRut(rut)) {
    throw new Error('El RUT ingresado no es válido');
  }

  // RUT único
  if (await findUserByRut(rut)) {
    throw new Error('El RUT ingresado ya se encuentra registrado');
  }

  // Email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El correo electrónico no tiene un formato válido');
  }

  if (await findUserByEmail(email)) {
    throw new Error('El correo electrónico ya se encuentra registrado');
  }

  // Generar contraseña automática
  const plainPassword = crypto.randomBytes(6).toString('base64') + '!';
  const password_hash = await bcrypt.hash(plainPassword, 10);

  // Crear usuario ADMIN
  const userId = await createUser({
    first_name,
    last_name,
    rut,
    email,
    password_hash,
    role: 'ADMIN',
    gender,
    date_of_birth
  });

  // Enviar correo con credenciales
  await sendAdminWelcomeEmail(
    email,
    `${first_name} ${last_name}`,
    plainPassword
  );

  return {
    message: 'Admin registrado correctamente',
    userId
  };
};

// SADM-001: Ver usuarios suspendidos (SuperAdmin)
export const getSuspendedUsersService = async () => {
  return await getSuspendedUsersRepository();
};

// SADM-002: Restaurar usuario suspendido (SuperAdmin)
export const restoreSuspendedUserService = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.status !== 'SUSPENDED') {
    throw new Error('El usuario no está suspendido');
  }

  // No se puede restaurar un SUPERADMIN
  if (user.role === 'SUPERADMIN') {
    throw new Error('No se puede restaurar un SuperAdmin');
  }

  await updateUserRepository(userId, { status: 'ACTIVE' });

  return { message: 'Usuario restaurado correctamente' };
};