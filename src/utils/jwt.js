import jwt from 'jsonwebtoken';
import { AppError } from './appError.js';

/**
 * Membuat token JWT baru berdasarkan payload user
 * @param {Object} payload - Data user (id_user, username, email)
 * @returns {string} Token JWT yang sudah ditandatangani
 * @throws {AppError} Jika JWT_SECRET belum dikonfigurasi di environment
 */
export const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET belum dikonfigurasi di environment', 500);
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Memvalidasi dan mengekstrak data dari token JWT
 * @param {string} token - Token JWT dari header Authorization
 * @returns {Object} Payload user hasil dekripsi token
 * @throws {AppError|TokenExpiredError|JsonWebTokenError} Jika token invalid/expired atau secret tidak dikonfigurasi
 */
export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET belum dikonfigurasi di environment', 500);
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};
