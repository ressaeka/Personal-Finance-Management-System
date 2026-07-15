import { createCategory, findAllCategory, findCategoryById, findCategoryByName, updateCategory, deleteCategory } from "../repositories/category.js";
import { AppError } from "../utils/appError.js";
import { validateCreateCategory, validateGetCategoryById, validateUpdateCategory, validateDeleteCategory} from "../validators/category.js";

export const createCategoryService = async (userId, nameCategory, tipe) => {
  const validatedData = validateCreateCategory( userId, nameCategory, tipe );

  const existingCategory = await findCategoryByName(
    validatedData.userId,
    validatedData.nameCategory
  );

  if (existingCategory) {
    throw new AppError("Nama kategori sudah digunakan", 409);
  }

  return await createCategory({
    userId: validatedData.userId,
    nameCategory: validatedData.nameCategory,
    tipe: validatedData.tipe,
  });
};

export const getAllCategoryService = async (userId) => {
  return await findAllCategory(userId);
};

export const getCategoryByIdService = async (id) => {
  const validId = validateGetCategoryById(id);

  const category = await findCategoryById(validId);

  if (!category || category.isDeleted) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }

  return category;
};

export const updateCategoryService = async ( id, userId, nameCategory, tipe ) => {
  const validatedData = validateUpdateCategory( id, userId, nameCategory, tipe );

  const category = await findCategoryById(validatedData.id);

  if (!category || category.userId !== validatedData.userId) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }

  const duplicate = await findCategoryByName(
    validatedData.userId,
    validatedData.nameCategory
  );

  if (duplicate && duplicate.id !== validatedData.id) {
    throw new AppError("Nama kategori sudah digunakan", 409);
  }

  return await updateCategory(validatedData.id, {
    nameCategory:
      validatedData.nameCategory ?? category.nameCategory,
    tipe: validatedData.tipe ?? category.tipe,
  });
};

export const deleteCategoryService = async (id, userId) => {
  const validatedData = validateDeleteCategory(id, userId);

  const category = await findCategoryById(validatedData.id);

  if (!category || category.userId !== validatedData.userId) {
    throw new AppError("Kategori tidak ditemukan", 404);
  }

  return await deleteCategory(validatedData.id);
};