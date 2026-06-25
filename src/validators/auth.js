import z from 'zod';
import { validate } from '../utils/validate.js';

const registerSchema = z.object({
  username: z.string({ message: 'Username harus diisi dan minimal 3 karakter' })
    .min(3, 'Username harus diisi dan minimal 3 karakter'),
  email: z.string({ message: 'Format email tidak valid' })
    .email('Format email tidak valid'),
  password: z.string({ message: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/\d/, 'Password harus mengandung angka')
    .regex(/[@$!%*?&]/, 'Password harus mengandung simbol'),
}).transform(({ username, email, password }) => ({
  username: username.trim(),
  email: email.toLowerCase().trim(),
  password,
}));

const loginSchema = z.object({
  username: z.string({ message: 'Username wajib diisi' })
    .min(1, 'Username wajib diisi'),
  password: z.string({ message: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi'),
}).transform(({ username, password }) => ({
  username: username.trim(),
  password,
}));

const userIdSchema = z.coerce.number({ message: 'ID user tidak valid' })
  .int('ID user tidak valid')
  .positive('ID user tidak valid');

const updateProfileFieldsSchema = z.object({
  username: z.string({ message: 'Username harus minimal 3 karakter' })
    .min(3, 'Username harus minimal 3 karakter')
    .transform(v => v.trim()),
  email: z.string({ message: 'Format email tidak valid' })
    .email('Format email tidak valid')
    .transform(v => v.toLowerCase().trim()),
  password: z.string({ message: 'Password minimal 8 karakter' })
    .min(8, 'Password minimal 8 karakter')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/\d/, 'Password harus mengandung angka')
    .regex(/[@$!%*?&]/, 'Password harus mengandung simbol'),
}).partial();

export const validateRegister = (username, email, password) => {
  return validate(registerSchema, { username, email, password });
};

export const validateLogin = (username, password) => {
  return validate(loginSchema, { username, password });
};

export const validateUserId = (id_user) => {
  return validate(userIdSchema, id_user);
};

export const validateUpdateProfile = (id_user, username, email, password) => {
  const validUserId = validate(userIdSchema, id_user);

  const data = {};
  if (username !== undefined && username !== null) {
    data.username = username;
  }
  if (email !== undefined && email !== null) {
    data.email = email;
  }
  if (password !== undefined && password !== null && password !== '') {
    data.password = password;
  }

  if (Object.keys(data).length === 0) {
    return { id_user: validUserId };
  }

  return {
    id_user: validUserId,
    ...validate(updateProfileFieldsSchema, data),
  };
};
