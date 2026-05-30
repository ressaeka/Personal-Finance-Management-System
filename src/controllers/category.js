import { categoryService, getAllCategoryService, getCategoryByIdService, updateCategoryService, deleteCategoryService } from '../service/category.js';
import { successResponse } from '../utils/response.js';

export const createCategory = async (req, res, next) => {
  try {
    const { nama_category, tipe, budget, warna, icon } = req.body;
    const id_user = req.user.id_user;
    const category = await categoryService(id_user, nama_category, tipe, budget, warna, icon);
    return successResponse(res, category, 'Category berhasil dibuat', 201);
  } catch (err) { return next(err); }
};

export const getAllCategory = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const category = await getAllCategoryService(id_user);
    return successResponse(res, { category }, 'Berhasil mengambil semua Category', 200);
  } catch (err) { return next(err); }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id_category } = req.params;
    const { id_user } = req.user;
    const category = await getCategoryByIdService(id_category, id_user);
    return successResponse(res, { category }, 'Berhasil mengambil category', 200);
  } catch (err) { return next(err); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { nama_category, tipe, budget, warna, icon } = req.body;
    const { id_user } = req.user;
    const { id_category } = req.params;
    const category = await updateCategoryService(id_category, id_user, nama_category, tipe, budget, warna, icon);
    return successResponse(res, category, 'Berhasil update category', 200);
  } catch (err) { return next(err); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { id_category } = req.params;
    const category = await deleteCategoryService(id_category, id_user);
    return successResponse(res, category, 'Category berhasil dihapus', 200);
  } catch (err) { return next(err); }
};
