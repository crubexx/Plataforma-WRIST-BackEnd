// ACC-001

const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@wrist.cl',
    password: 'Admin123!',
    role: 'ADMIN'
  },
  {
    id: 2,
    name: 'Docente User',
    email: 'docente@wrist.cl',
    password: 'Docente123!',
    role: 'DOCENTE'
  },
  {
    id: 3,
    name: 'Participant User',
    email: 'user@wrist.cl',
    password: 'User123!',
    role: 'USUARIO'
  }
];

// ACC-001 / ACC-002: Buscar usuario por email
export const findUserByEmail = async (email) => {
  return users.find(user => user.email === email);
};

// ACC-002
export const createUser = async (userData) => {
  const newUser = {
    id: users.length + 1,
    ...userData
  };

  users.push(newUser);
  return newUser;
};