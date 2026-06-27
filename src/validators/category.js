import z from 'zod';
import { validate } from '../utils/validate.js';


const userIdSchema = z.coerce.number({ message: 'User tidak ditemukan' })
.int('User tidak ditemukan')
.positive('User tidak ditemukan');

const categoryIdSchema = z.coerce.number({ message: 'ID category tidak valid' })
.int('ID category tidak valid')
.positive('ID category tidak valid');

const tipeSchema = z.enum(["pemasukan", "pengeluaran"], {
  message: "Tipe harus 'pemasukan' atau 'pengeluaran'",
});

const categoryDataSchema = z.object({
  nama_category: z.string()
  .min(3, 'Nama category harus diisi dan minimal 3 karakter')
  .transform(v => v.trim()),
  tipe: tipeSchema,
});

const categoryDataPartialSchema = z.object({
  nama_category: z.string()
    .min(3, 'Nama category minimal 3 karakter')
    .transform(v => v.trim()),
  tipe: tipeSchema,
});

export const validateUserId = (id_user) => {
  const result = validate(userIdSchema, id_user);
  return Number(result);
};

export const validateCategoryId = (id_category) => {
  const result = validate(categoryIdSchema, id_category);
  return Number(result);
};

export const validateCategoryData = (nama_category, tipe, isRequired = true) => {
  if (isRequired) {
    return validate(categoryDataSchema, { nama_category, tipe });
  }

  const data = {};
  if (nama_category !== undefined && nama_category !== null) {
    data.nama_category = nama_category;
  }
  if (tipe !== undefined && tipe !== null) {
    data.tipe = tipe;
  }

  if (Object.keys(data).length === 0) {
    return {};
  }

  return validate(categoryDataPartialSchema, data);
};

export const validateCreateCategory = (id_user, nama_category, tipe) => {
  const validUserId = validateUserId(id_user);
  const { nama_category: validNama, tipe: validTipe } = validateCategoryData(nama_category, tipe, true);

  return {
    id_user: validUserId,
    nama_category: validNama,
    tipe: validTipe,
  };
};

export const validateGetCategoryById = (id_category, id_user) => {
  const validCategoryId = validateCategoryId(id_category);
  const validUserId = validateUserId(id_user);

  return {
    id_category: validCategoryId,
    id_user: validUserId,
  };
};

export const validateUpdateCategory = (id_category, id_user, nama_category, tipe) => {
  const validCategoryId = validateCategoryId(id_category);
  const validUserId = validateUserId(id_user);
  const { nama_category: validNama, tipe: validTipe } = validateCategoryData(nama_category, tipe, false);

  return {
    id_category: validCategoryId,
    id_user: validUserId,
    nama_category: validNama,
    tipe: validTipe,
  };
};

export const validateDeleteCategory = (id_category, id_user) => {
  const validCategoryId = validateCategoryId(id_category);
  const validUserId = validateUserId(id_user);

  return {
    id_category: validCategoryId,
    id_user: validUserId,
  };
};
