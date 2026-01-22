import { getAllUsersRepository } from '../repositories/adminRepository.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  findUserByRut,
  findUserByEmail,
  createUser
} from '../repositories/authRepository.js';
import { sendTeacherWelcomeEmail } from '../utils/mailService.js';
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

  // 1️⃣ Campos obligatorios
  if (!first_name) throw new Error('Falta completar el campo Nombre');
  if (!last_name) throw new Error('Falta completar el campo Apellidos');
  if (!rut) throw new Error('Falta completar el campo RUT');
  if (!email) throw new Error('Falta completar el campo Correo electrónico');
  if (!gender) throw new Error('Falta completar el campo Género');
  if (!date_of_birth) throw new Error('Falta completar el campo Edad');

  // 2️⃣ Validaciones nombre
  if (first_name.length < 2 || last_name.length < 2) {
    throw new Error('El nombre y apellidos deben tener al menos 2 caracteres');
  }

  // 3️⃣ Validación RUT formato
  const rutRegex = /^\d{7,8}[0-9Kk]$/;
  if (!rutRegex.test(rut)) {
    throw new Error('El RUT debe ingresarse sin puntos ni guión (ej.: 12456789K)');
  }

  if (!isValidRut(rut)) {
    throw new Error('El RUT ingresado no es válido');
  }

  // 4️⃣ RUT único
  if (await findUserByRut(rut)) {
    throw new Error('El RUT ingresado ya se encuentra registrado');
  }

  // 5️⃣ Email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El correo electrónico no tiene un formato válido');
  }

  if (await findUserByEmail(email)) {
    throw new Error('El correo electrónico ya se encuentra registrado');
  }

  // 6️⃣ Generar contraseña automática
  const plainPassword = crypto.randomBytes(6).toString('base64') + '!';
  const password_hash = await bcrypt.hash(plainPassword, 10);

  // 7️⃣ Crear usuario DOCENTE
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

  // 8️⃣ Enviar correo con credenciales
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