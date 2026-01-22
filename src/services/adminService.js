import { getAllUsersRepository } from '../repositories/adminRepository.js';

export const getAllUsersService = async () => {
  return await getAllUsersRepository();
};

