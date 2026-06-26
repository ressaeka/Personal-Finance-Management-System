import { createCategory, getAllCategory, getCategoryById, updateCategory, deleteCategory } from "../models/category.js";
import { AppError } from "../utils/appError.js";
import { validateCreateCategory, validateGetCategoryById, validateUpdateCategory, validateDeleteCategory } from "../validators/category.js";

export const categoryService = async (id_user, nama_category, tipe) => {
  const validatedData = validateCreateCategory(id_user, nama_category, tipe);

  const existing = await getAllCategory(validatedData.id_user);
  const duplicate = existing.find(
    (c) => c.nama_category.toLowerCase() === validatedData.nama_category.toLowerCase(),
  );
  if (duplicate) {
    throw new AppError("Nama category sudah ada", 409);
  }

  const newCategory = await createCategory(
    validatedData.id_user,
    validatedData.nama_category,
    validatedData.tipe,
  );

  if (!newCategory) {
    throw new AppError("Category gagal dibuat", 500);
  }

  return newCategory;
};

export const getAllCategoryService = async (id_user) => {
  if (!id_user) {
    throw new AppError("User tidak ditemukan", 401);
  }

  const category = await getAllCategory(id_user);
  return category;
};

export const getCategoryByIdService = async (id_category, id_user) => {
  const validatedData = validateGetCategoryById(id_category, id_user);
  const category = await getCategoryById(validatedData.id_category, validatedData.id_user);

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  return category;
};

export const updateCategoryService = async (id_category, id_user, nama_category, tipe) => {
  const validatedData = validateUpdateCategory(id_category, id_user, nama_category, tipe);

  const existingCategory = await getCategoryById(validatedData.id_category, validatedData.id_user);
  if (!existingCategory) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  const category = await updateCategory(
    validatedData.id_category,
    validatedData.id_user,
    validatedData.nama_category || existingCategory.nama_category,
    validatedData.tipe || existingCategory.tipe,
  );

  if (!category) {
    throw new AppError("Category gagal diupdate", 500);
  }

  return category;
};

export const deleteCategoryService = async (id_category, id_user) => {
  const validatedData = validateDeleteCategory(id_category, id_user);

  const category = await deleteCategory(validatedData.id_category, validatedData.id_user);

  if (!category) {
    throw new AppError("Category tidak ditemukan atau sudah dihapus", 404);
  }

  return category;
};
