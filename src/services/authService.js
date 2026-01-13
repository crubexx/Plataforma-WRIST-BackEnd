export const loginUser = async (email, password) => {
  // LOGIN SIMULADO 
  if (email === 'admin@wrist.cl' && password === 'Admin123!') {
    return {
      id: 1,
      name: 'Admin User',
      email: 'admin@wrist.cl',
      role: 'ADMIN'
    };
  }

  return null;
};

import { findUserByEmail, createUser } from '../repositories/authRepository.js';

export const registerUser = async (data) => {
  const {
    email,
    name,
    password,
    confirmPassword,
    age,
    gender
  } = data;

  // 1. Campos obligatorios
  if (!email || !name || !password || !confirmPassword || !age || !gender) {
    throw new Error('Todos los campos son obligatorios');
  }

  // 2. Email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('El correo electrónico no tiene un formato válido');
  }

  // 3. Password match
  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }

  // 4. Password rules (ERS)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/;

  if (!passwordRegex.test(password)) {
    throw new Error(
      'La contraseña debe tener entre 8 y 15 caracteres, incluir mayúscula, minúscula, número y símbolo'
    );
  }

  // 5. Usuario existente
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error(
      'Ya existe una cuenta con este correo. Puedes iniciar sesión o recuperar tu contraseña'
    );
  }

  // 6. Crear usuario
  const newUser = await createUser({
    email,
    name,
    password,
    age,
    gender,
    role: 'USUARIO'
  });

  return {
    message: 'Usuario registrado correctamente',
    user: newUser
  };
};
