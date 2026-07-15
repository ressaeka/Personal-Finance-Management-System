import { createCategoryService, getAllCategoryService, getCategoryByIdService, updateCategoryService, deleteCategoryService } from "../service/category.js";
import { successResponse } from "../utils/response.js";

export const createCategory = async (req, res, next) => {
  try {
    const { nameCategory, tipe } = req.body;

    const category = await createCategoryService(
      req.user.id,
      nameCategory,
      tipe
    );

    return successResponse(res, category,"Category berhasil dibuat", 201 );

  } catch (err) {
    next(err);
  }
};

export const getAllCategory = async (req, res, next) => {
  try {
    const categories = await getAllCategoryService(req.user.id);

    return successResponse( res, categories, "Berhasil mengambil semua category" ); 

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

    return successResponse( res, category, "Berhasil mengambil category" );

  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { nameCategory, tipe } = req.body;

    const category = await updateCategoryService(
      Number(req.params.id),
      req.user.id,
      nameCategory,
      tipe
    );

    return successResponse( res, category, "Berhasil mengupdate category" );
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

    return successResponse( res, category, "Category berhasil dihapus" );
  } catch (err) {
    next(err);
  }
};