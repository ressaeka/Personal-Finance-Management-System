import {
  registerService,
  loginService,
  getProfileService,
  updateUserByIdService,
} from '../service/auth.js';
import { successResponse } from '../utils/response.js';

/**
 * Controller untuk menangani registrasi user baru
 * @param {Object} req - Express request object (mengandung username, email, password di body)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerService({ username, email, password });

    return successResponse(res, result, 'Register Berhasil', 201);
  } catch (err) {
    return next(err);
  }
};

/**
 * Controller untuk menangani proses login user
 * @param {Object} req - Express request object (mengandung username dan password di body)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await loginService({ username, password });

    return successResponse(res, result, 'Login Berhasil', 200);
  } catch (err) {
    return next(err);
  }
};

/**
 * Controller untuk mengambil data profil user yang sedang login
 * @param {Object} req - Express request object (mengandung data user terautentikasi dari middleware)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const profile = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const result = await getProfileService({ id_user });

    return successResponse(res, result, 'Berhasil mengambil data user', 200);
  } catch (err) {
    return next(err);
  }
};

/**
 * Controller untuk memperbarui data pribadi user
 * @param {Object} req - Express request object (mengandung id_user di token, dan data baru di body)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const updateUser = async (req, res, next) => {
  try {
    const id_user = req.user.id_user;
    const { username, email, password } = req.body;

    const result = await updateUserByIdService(
      id_user,
      username,
      email,
      password,
    );

    return successResponse(res, result, 'Berhasil memperbarui data user', 200);
  } catch (err) {
    return next(err);
  }
};

/**
 * Controller untuk menangani proses logout user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const logout = async (req, res, _next) => {
  // Karena menggunakan Stateless JWT, logout cukup memberikan respon sukses ke client
  // agar client menghapus tokennya di LocalStorage/Cookies.
  return successResponse(res, null, 'Logout Berhasil', 200);
};
