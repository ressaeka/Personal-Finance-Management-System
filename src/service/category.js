import {
  createCategory,
  findAllCategory,
  findCategoryById,
  findCategoryByName,
  updateCategory,
  deleteCategory,
} from "../repositories/category.js";
import { AppError } from "../utils/appError.js";

export const createCategoryService = async (userId, categoryData) => {
  const existingCategory = await findCategoryByName(
    userId,
    categoryData.nama_category
  );

  if (existingCategory) {
    throw new AppError("Nama kategori sudah digunakan", 409);
  }

  return await createCategory({
    userId,
    nameCategory: categoryData.nama_category,
    tipe: categoryData.tipe,
  });
};

export const getAllCategoryService = async (userId) => {
  return await findAllCategory(userId);
};

export const getCategoryByIdService = async (id, userId) => {
  const category = await findCategoryById(id);

  if (!category || category.userId !== userId || category.isDeleted) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }

  return category;
};

export const updateCategoryService = async ( id, userId, categoryData) => {
  const category = await findCategoryById(id);

  if (!category || category.userId !== userId) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }

  if (categoryData.nama_category) {
    const duplicate = await findCategoryByName(
      userId,
      categoryData.nama_category
    );

    if (duplicate && duplicate.id !== id) {
      throw new AppError("Nama kategori sudah digunakan", 409);
    }
  }

  return await updateCategory(id, {
    nameCategory:
      categoryData.nama_category ?? category.nameCategory,
    tipe: categoryData.tipe ?? category.tipe,
  });
};

export const deleteCategoryService = async (id, userId) => {
  const category = await findCategoryById(id);

  if (!category || category.userId !== userId) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }

  return await deleteCategory(id);
};