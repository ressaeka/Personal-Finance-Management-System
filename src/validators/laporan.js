import { AppError } from '../utils/appError.js';

export const validateDashboardStats = (userId) => {
  if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
    throw new AppError('User tidak ditemukan/terautentikasi', 401);
  }
  return Number(userId);
};

export const validateMonthlyReport = (userId) => {
  if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
    throw new AppError('User tidak ditemukan/terautentikasi', 401);
  }
  return Number(userId);
};

export const validateCategoryReport = (userId) => {
  if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
    throw new AppError('User tidak ditemukan/terautentikasi', 401);
  }
  return Number(userId);
};
