import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../utils/mailService.js';
import { updateGoogleUserData, findUserByEmail, findUserByRut, createUser, saveResetToken, findUserByResetToken, updatePassword } from '../repositories/authRepository.js';
import { isValidRut } from '../utils/rutValidator.js';
//import { registerUserSession, deactivateUserSession } from '../repositories/sessionRepository.js';

// ACC-001: Inicio de Sesión 
export const loginUser = async (email, password) => {
  // 1. Buscar usuario por email
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  // 2. Verificar estado de la cuenta
  if (user.status !== 'ACTIVE') {
    throw new Error('La cuenta no se encuentra activa, contacte al administrador.');
  }

  // 3. Verificar contraseña
  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    return null;
  }

  // 4. Payload del token
  const payload = {
    id_user: user.id_user,
    email: user.email,
    role: user.role
  };

  // 5. Generar JWT
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // 6. Registrar sesión activa del usuario
  //await registerUserSession(user.id_user);

  // 7. Retornar token y usuario
  return {
    token,
    user: {
      id: user.id_user.toString(),
      name: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      state: user.status.toLowerCase(),
      rut: user.rut,
      gender: user.gender,
      birthdate: user.date_of_birth,
      authMethod: 'email'
    }
  };
};

// ACC-002: Registro de Usuario
export const registerUser = async (data) => {
  const {
    first_name,
    last_name,
    rut,
    email,
    password,
    confirmPassword,
    gender,
    date_of_birth
  } = data;

  // 1. Campos obligatorios
  if (
    !first_name ||
    !last_name ||
    !rut ||
    !email ||
    !password ||
    !confirmPassword ||
    !gender ||
    !date_of_birth
  ) {
    throw new Error('Todos los campos son obligatorios');
  }

  // 2. Validación nombre
  if (first_name.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres');
  }

  // 3. Validación apellido
  if (last_name.length < 2) {
    throw new Error('El apellido debe tener al menos 2 caracteres');
  }

  // 4. Validación formato RUT (sin puntos ni guión)
  const rutFormatRegex = /^\d{7,8}[0-9Kk]$/;
  if (!rutFormatRegex.test(rut)) {
    throw new Error('El RUT debe ingresarse sin puntos ni guión');
  }

  // 5. Validación RUT chileno (DV)
  if (!isValidRut(rut)) {
    throw new Error('El RUT ingresado no es válido');
  }

  // 6. Email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El correo electrónico no tiene un formato válido');
  }

  // 7. Password match
  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }

  // 8. Reglas de contraseña (ERS)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,30}$/;

  if (!passwordRegex.test(password)) {
    throw new Error(
      'La contraseña debe tener entre 8 y 30 caracteres, incluir mayúscula, minúscula, número y símbolo'
    );
  }

  // 9. Validar RUT existente
  const existingRut = await findUserByRut(rut);
  if (existingRut) {
    throw new Error(
      'Ya existe una cuenta asociada a este RUT. Si es tu cuenta, intenta iniciar sesión.'
    );
  }

  // 10. Validar Email existente
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    throw new Error(
      'Ya existe una cuenta con este correo. Puedes iniciar sesión o recuperar tu contraseña.'
    );
  }

  // 11. Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // 12. Crear usuario
  const userId = await createUser({
    first_name,
    last_name,
    rut,
    email,
    password_hash,
    role: 'USUARIO',
    gender,
    date_of_birth
  });

  return {
    message: 'Usuario registrado correctamente',
    userId
  };
};

// ACC-003: Cerrar sesión
export const logoutUserService = async (userId) => {
  await deactivateUserSession(userId);
};

// ACC-004: Solicitar recuperación
export const recoverPassword = async (email) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('El correo electrónico no se encuentra registrado');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await saveResetToken(email, token, expires);

  const link = `${process.env.FRONTEND_URL}/acceso/restablecer-contrasena?token=${token}`;

  await sendResetPasswordEmail(
    email,
    link,
    user.first_name
  );

  return { message: 'Correo de recuperación enviado' };
};



// ACC-004: Resetear contraseña
export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new Error('Token y nueva contraseña son obligatorios');
  }

  const user = await findUserByResetToken(token);

  if (!user) {
    throw new Error('El enlace es inválido o ha expirado');
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,30}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new Error(
      'La contraseña debe tener entre 8 y 30 caracteres, incluir mayúscula, minúscula, número y símbolo'
    );
  }

  const password_hash = await bcrypt.hash(newPassword, 10);

  await updatePassword(user.id_user, password_hash);

  return { message: 'Contraseña actualizada correctamente' };
};

export const completeGoogleRegistration = async (
  id_user,
  rut,
  gender,
  date_of_birth
) => {

  if (!rut) throw new Error('Falta completar el campo RUT');
  if (!gender) throw new Error('Falta completar el campo Género');
  if (!date_of_birth) throw new Error('Falta completar el campo Fecha de nacimiento');

  // Validación formato RUT
  const rutRegex = /^\d{7,8}[0-9Kk]$/;
  if (!rutRegex.test(rut)) {
    throw new Error('El RUT debe ingresarse sin puntos ni guión');
  }

  if (!isValidRut(rut)) {
    throw new Error('El RUT ingresado no es válido');
  }

  const existingRut = await findUserByRut(rut);
  if (existingRut) {
    throw new Error('El RUT ya se encuentra registrado');
  }

  // Calcular edad
  const birthDate = new Date(date_of_birth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || 
     (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 16) {
    throw new Error('Debe tener al menos 16 años para registrarse');
  }

  await updateGoogleUserData(
    id_user,
    rut,
    gender,
    date_of_birth
  );

  return {
    message: 'Registro completado correctamente',
    age
  };
};