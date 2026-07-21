import {
  createCategory,
  findCategoryById,
  findAllCategory,
  findCategoryByName,
  updateCategory,
  deleteCategory,
  countCategory,
} from "../repositories/category.js";
import { AppError } from "../utils/appError.js";


export const createCategoryService = async (userId, body) => {
  const { nameCategory, tipe } = body;

  const category = await findCategoryByName(userId, nameCategory);

  if (category) {
    throw new AppError("Category sudah ada", 409);
  }

  return await createCategory({
    userId,
    nameCategory,
    tipe,
  });
};


export const getAllCategoryService = async (userId, { page = 1, limit = 50 } ) => {
  const skip = (page - 1) * limit;

  const [categories, totalData] = await Promise.all([
    findAllCategory({
      userId,
      skip,
      take: limit,
    }),
    countCategory(userId),
  ]);

  return {
    pagination: {
      page,
      limit,
      totalData,
      totalPage: Math.ceil(totalData / limit),
    },
    data: categories,
  };
};

export const getCategoryByIdService = async (categoryId, userId) => {
  const category = await findCategoryById({
    id: categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  return category;
};


export const updateCategoryService = async ( categoryId, userId, body ) => {
  const category = await findCategoryById({
    id: categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  if (body.nameCategory) {
    const existCategory = await findCategoryByName(
      userId,
      body.nameCategory
    );

    if (existCategory && existCategory.id !== categoryId) {
      throw new AppError("Category sudah digunakan", 409);
    }
  }

  return await updateCategory(categoryId, body);
};


export const deleteCategoryService = async ( categoryId, userId ) => {
  const category = await findCategoryById({
    id: categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  return await deleteCategory(categoryId);
};