import z from 'zod';
import { validate } from '../utils/validate.js';

const userIdSchema = z.coerce.number({ message: 'User tidak ditemukan/terautentikasi' })
  .int('User tidak ditemukan/terautentikasi')
  .positive('User tidak ditemukan/terautentikasi');

const validateUserId = (userId) => {
  return validate(userIdSchema, userId, 401);
};

export const validateDashboardStats = (userId) => {
  return validateUserId(userId);
};

export const validateMonthlyReport = (userId) => {
  return validateUserId(userId);
};

export const validateCategoryReport = (userId) => {
  return validateUserId(userId);
};
