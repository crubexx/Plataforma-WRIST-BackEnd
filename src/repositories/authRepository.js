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

const findByEmail = async (email) => {
  return users.find(user => user.email === email);
};

module.exports = {
  findByEmail
};
