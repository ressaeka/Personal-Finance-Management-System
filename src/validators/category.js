import { AppError } from '../utils/appError.js';

export const validateUserId = (id_user) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('User tidak ditemukan/terautentikasi', 401);
  }
  return Number(id_user);
};

export const validateCategoryId = (id_category) => {
  if (
    !id_category ||
    !Number.isInteger(Number(id_category)) ||
    Number(id_category) <= 0
  ) {
    throw new AppError('ID category tidak valid', 400);
  }
  return Number(id_category);
};

export const validateCategoryData = (nama_category, tipe, isRequired = true) => {
  if (isRequired) {
    if (!nama_category || nama_category.trim().length < 3) {
      throw new AppError('Nama category harus diisi dan minimal 3 karakter', 400);
    }

    if (!tipe || (tipe !== 'pemasukan' && tipe !== 'pengeluaran')) {
      throw new AppError("Tipe harus 'pemasukan' atau 'pengeluaran'", 400);
    }
  } else {
    if (nama_category !== undefined && nama_category !== null) {
      if (typeof nama_category !== 'string' || nama_category.trim().length < 3) {
        throw new AppError('Nama category minimal 3 karakter', 400);
      }
    }

    if (tipe !== undefined && tipe !== null) {
      if (tipe !== 'pemasukan' && tipe !== 'pengeluaran') {
        throw new AppError("Tipe harus 'pemasukan' atau 'pengeluaran'", 400);
      }
    }
  }

  return {
    nama_category: nama_category ? nama_category.trim() : undefined,
    tipe,
  };
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
