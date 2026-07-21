import {
  createCategoryService,
  getAllCategoryService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} from "../service/category.js";
import { successResponse } from "../utils/response.js";


export const createCategory = async (req, res, next) => {
  try {
    const category = await createCategoryService(
      req.user.id,
      req.body
    );

    return successResponse(
      res,
      category,
      "Category berhasil dibuat",
      201
    );
  } catch (err) {
    next(err);
  }
};


export const getAllCategory = async (req, res, next) => {
  try {
    const categories = await getAllCategoryService(
      req.user.id,
      req.query
    );

    return successResponse(
      res,
      categories,
      "Berhasil mengambil semua category",
      200
    );
  } catch (err) {
    next(err);
  }
};


export const getCategoryById = async (req, res, next) => {
  try {
    const category = await getCategoryByIdService(
      Number(req.params.id),
      req.user.id
    );

    return successResponse(
      res,
      category,
      "Berhasil mengambil category",
      200
    );
  } catch (err) {
    next(err);
  }
};


export const updateCategory = async (req, res, next) => {
  try {
    const category = await updateCategoryService(
      Number(req.params.id),
      req.user.id,
      req.body
    );

    return successResponse(
      res,
      category,
      "Category berhasil diperbarui",
      200
    );
  } catch (err) {
    next(err);
  }
};



export const deleteCategory = async (req, res, next) => {
  try {
    const category = await deleteCategoryService(
      Number(req.params.id),
      req.user.id
    );

    return successResponse(
      res,
      category,
      "Category berhasil dihapus",
      200
    );
  } catch (err) {
    next(err);
  }
};