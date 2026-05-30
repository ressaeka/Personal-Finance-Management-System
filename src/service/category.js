import { createCategory, getAllCategory, getCategoryById, updateCategory, deleteCategory } from '../models/category.js';
import { AppError } from '../utils/appError.js';

export const categoryService = async (id_user, nama_category, tipe, budget, warna, icon) => {
  if (!id_user) throw new AppError('User tidak ditemukan/terautentikasi', 401);
  if (!nama_category || nama_category.trim().length < 3) throw new AppError('Category harus diisi dan minimal 3 karakter', 400);
  if (!tipe || (tipe !== 'pemasukan' && tipe !== 'pengeluaran')) throw new AppError("Tipe harus 'pemasukan' atau 'pengeluaran'", 400);

  const existing = await getAllCategory(id_user);
  const duplicate = existing.find(c => c.nama_category.toLowerCase() === nama_category.toLowerCase());
  if (duplicate) throw new AppError('Nama category sudah ada', 409);

  const newCategory = await createCategory(id_user, nama_category, tipe, budget || null, warna || '#6366f1', icon || 'FolderOpen');
  if (!newCategory) throw new AppError('Category gagal dibuat', 500);
  return newCategory;
};

export const getAllCategoryService = async (id_user) => {
  if (!id_user) throw new AppError('User tidak ditemukan/terautentikasi', 401);
  return await getAllCategory(id_user);
};

export const getCategoryByIdService = async (id_category, id_user) => {
  if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) throw new AppError('ID category tidak valid', 400);
  if (!id_user) throw new AppError('User tidak ditemukan/terautentikasi', 401);
  const category = await getCategoryById(id_category, id_user);
  if (!category) throw new AppError('Category tidak ditemukan', 404);
  return category;
};

export const updateCategoryService = async (id_category, id_user, nama_category, tipe, budget, warna, icon) => {
  if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) throw new AppError('ID category tidak valid', 400);
  if (!id_user) throw new AppError('User tidak ditemukan', 401);
  if (!nama_category || nama_category.trim().length < 3) throw new AppError('Nama category minimal 3 karakter', 400);
  if (!tipe || (tipe !== 'pemasukan' && tipe !== 'pengeluaran')) throw new AppError("Tipe harus 'pemasukan' atau 'pengeluaran'", 400);

  const existingCategory = await getCategoryById(id_category, id_user);
  if (!existingCategory) throw new AppError('Category tidak ditemukan', 404);

  const all = await getAllCategory(id_user);
  const duplicate = all.find(c => c.id_category !== Number(id_category) && c.nama_category.toLowerCase() === nama_category.toLowerCase());
  if (duplicate) throw new AppError('Nama category sudah ada', 409);

  const category = await updateCategory(id_category, id_user, nama_category, tipe, budget || null, warna || '#6366f1', icon || 'FolderOpen');
  if (!category) throw new AppError('Category gagal diupdate', 500);
  return category;
};

export const deleteCategoryService = async (id_category, id_user) => {
  if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) throw new AppError('ID category tidak valid', 400);
  if (!id_user) throw new AppError('User tidak ditemukan/terautentikasi', 401);
  const category = await deleteCategory(id_category, id_user);
  if (!category) throw new AppError('Category tidak ditemukan atau sudah dihapus', 404);
  return category;
};
