import {
  createUsers,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  updateUserById,
} from '../models/auth.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { AppError } from '../utils/appError.js';

// --- REUSABLE REGEX CONSTANTS ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Service untuk memproses registrasi user baru
 * @param {Object} userData - Data user dari body request (username, email, password)
 * @returns {Object} Data user yang berhasil didaftarkan tanpa password
 */
export const registerService = async (userData) => {
  const { username, email, password } = userData;

  // Validasi Kelengkapan dan Format Input (400 Bad Request)
  if (!username || !email || !password) {
    throw new AppError('Username, email dan password wajib diisi', 400);
  }

  if (username.trim().length < 3) {
    throw new AppError('Username minimal 3 karakter', 400);
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('Format email tidak valid', 400);
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    throw new AppError(
      'Password harus minimal 8 karakter, mengandung huruf kecil, huruf besar, angka, dan simbol',
      400,
    );
  }

  // Validasi Unik / Duplikasi Data (409 Conflict)
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    throw new AppError('Email sudah terdaftar', 409);
  }

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw new AppError('Username sudah terdaftar', 409);
  }

  // Proses Hashing Password dan Penyimpanan ke Database
  const hashedPassword = await hashPassword(password);
  const newUser = await createUsers({
    username: username.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  // Ekslusi properti password sebelum data dikembalikan ke client
  const userWithoutPassword = Object.fromEntries(
    Object.entries(newUser).filter(([key]) => key !== 'password'),
  );
  return userWithoutPassword;
};

/**
 * Service untuk memproses autentikasi login user
 * @param {Object} credentials - Kredensial login (username, password)
 * @returns {Object} Token JWT dan data ringkas profil user
 */
export const loginService = async ({ username, password }) => {
  // Validasi Kelengkapan Input (400 Bad Request)
  if (!username || !password) {
    throw new AppError('Username dan Password wajib diisi', 400);
  }

  // Validasi Keberadaan Akun Berdasarkan Username (401 Unauthorized)
  const user = await findUserByUsername(username);
  if (!user) {
    throw new AppError('Username atau password salah', 401);
  }

  // Validasi Kecocokan Password (401 Unauthorized)
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Username atau password salah', 401);
  }

  // Pembuatan Access Token JWT
  const token = generateToken({
    id_user: user.id_user,
    username: user.username,
    email: user.email,
  });

  return {
    token,
    user: {
      id_user: user.id_user,
      username: user.username,
      email: user.email,
    },
  };
};

/**
 * Service untuk mengambil data profil user berdasarkan ID
 * @param {Object} params - Parameter ID User
 * @returns {Object} Data profil user (id, username, email)
 */
export const getProfileService = async ({ id_user }) => {
  // Validasi Keberadaan ID User (404 Not Found)
  if (!id_user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  const user = await findUserById(id_user);
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

    return {
        id_user: user.id_user,
        username: user.username,
        email: user.email,
    };
};

/**
 * Service untuk memperbarui data profile user berdasarkan ID
 * @param {number|string} id_user - ID user yang akan diupdate
 * @param {string} username - Nama user baru
 * @param {string} email - Email baru
 * @param {string} [password] - Password baru (opsional)
 * @returns {Object} Data user yang telah diperbarui dari database
 */
export const updateUserByIdService = async (
  id_user,
  username,
  email,
  password,
) => {
  // Validasi Format Parameter ID dan Format Input (400 Bad Request)
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('Id user tidak valid', 400);
  }

  if (!username || username.trim().length < 3) {
    throw new AppError('Username harus diisi dan minimal 3 karakter', 400);
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    throw new AppError('Format email tidak valid', 400);
  }

  // Validasi Struktur Password Baru (Hanya diproses jika password diisi)
  let hashedPassword;
  if (password) {
    if (!STRONG_PASSWORD_REGEX.test(password)) {
      throw new AppError(
        'Password harus minimal 8 karakter, mengandung huruf kecil, huruf besar, angka, dan simbol',
        400,
      );
    }
    hashedPassword = await hashPassword(password);
  }

  // Validasi Duplikasi Data dengan Akun Lain (409 Conflict)
  const existingEmail = await findUserByEmail(email);
  if (existingEmail && existingEmail.id_user !== Number(id_user)) {
    throw new AppError('Email sudah terdaftar', 409);
  }

  const existingUsername = await findUserByUsername(username);
  if (existingUsername && existingUsername.id_user !== Number(id_user)) {
    throw new AppError('Username sudah terdaftar', 409);
  }

  // Memastikan User yang Akan Diupdate Memang Ada di DB (404 Not Found)
  const user = await findUserById(id_user);
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  // Eksekusi Pembaruan Data ke Database
  const finalPassword = hashedPassword || user.password;
  const updatedUser = await updateUserById(
    id_user,
    username.trim(),
    email.toLowerCase(),
    finalPassword,
  );

  // Proteksi Kegagalan Query/Internal Database (500 Internal Server Error)
  if (!updatedUser) {
    throw new AppError('Gagal memperbarui data user', 500);
  }

  return updatedUser;
};
