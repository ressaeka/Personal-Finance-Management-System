import { AppError } from '../utils/appError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateRegister = (username, email, password) => {
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    throw new AppError('Username harus diisi dan minimal 3 karakter', 400);
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    throw new AppError('Format email tidak valid', 400);
  }

  if (!password || typeof password !== 'string') {
    throw new AppError('Password wajib diisi', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password minimal 8 karakter', 400);
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    throw new AppError(
      'Password harus mengandung huruf kecil, huruf besar, angka, dan simbol',
      400,
    );
  }

  return {
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password,
  };
};

export const validateLogin = (username, password) => {
  if (!username || typeof username !== 'string' || username.trim() === '') {
    throw new AppError('Username wajib diisi', 400);
  }

  if (!password || typeof password !== 'string' || password === '') {
    throw new AppError('Password wajib diisi', 400);
  }

  return {
    username: username.trim(),
    password,
  };
};

export const validateUserId = (id_user) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('ID user tidak valid', 400);
  }

  return Number(id_user);
};

export const validateUpdateProfile = (id_user, username, email, password) => {
  const validUserId = validateUserId(id_user);

  let validUsername;
  if (username !== undefined && username !== null) {
    if (typeof username !== 'string' || username.trim().length < 3) {
      throw new AppError('Username harus minimal 3 karakter', 400);
    }
    validUsername = username.trim();
  }

  let validEmail;
  if (email !== undefined && email !== null) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      throw new AppError('Format email tidak valid', 400);
    }
    validEmail = email.toLowerCase().trim();
  }

  let validPassword;
  if (password !== undefined && password !== null && password !== '') {
    if (typeof password !== 'string') {
      throw new AppError('Password harus berupa string', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password minimal 8 karakter', 400);
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      throw new AppError(
        'Password harus mengandung huruf kecil, huruf besar, angka, dan simbol',
        400,
      );
    }
    validPassword = password;
  }

  return {
    id_user: validUserId,
    username: validUsername,
    email: validEmail,
    password: validPassword,
  };
};
