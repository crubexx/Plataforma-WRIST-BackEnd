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
