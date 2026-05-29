import { categoryService, getAllCategoryService, getCategoryByIdService, updateCategoryService, deleteCategoryService } from "../service/category.js";
import { successResponse } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

/**
 * Controller untuk membuat kategori baru milik user yang sedang terautentikasi
 * @param {Object} req - Express request object (mengandung nama_category, tipe di body dan user di token)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const category = async (req, res, next) => {
    try {
        const { nama_category, tipe } = req.body;
        const id_user = req.user.id_user;

        const category = await categoryService(id_user, nama_category, tipe);

        return successResponse(res, {
            id_category: category.id_category,
            nama_category: category.nama_category,
            tipe: category.tipe
        }, "Category berhasil dibuat", 201);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk mengambil seluruh daftar kategori milik user yang sedang terlogin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const getAllCategory = async (req, res, next) => {
    try {
        const { id_user } = req.user;
        const category = await getAllCategoryService(id_user);

        return successResponse(res, { category }, "Berhasil mengambil semua Category", 200);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk mengambil satu detail kategori berdasarkan ID kategori
 * @param {Object} req - Express request object (mengandung id_category di params)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const getCategoryById = async (req, res, next) => {
    try {
        const { id_category } = req.params;
        const { id_user } = req.user;

        const category = await getCategoryByIdService(id_category, id_user);

        return successResponse(res, { category }, "Berhasil mengambil category", 200);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk memperbarui data kategori berdasarkan ID kategori
 * @param {Object} req - Express request object (mengandung data baru di body dan id_category di params)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const updateCategory = async (req, res, next) => {
    try {
        const { nama_category, tipe } = req.body;
        const { id_user } = req.user;
        const { id_category } = req.params;

        const category = await updateCategoryService(id_category, id_user, nama_category, tipe);

        return successResponse(res, category, "Berhasil update category", 200);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk menghapus kategori berdasarkan ID kategori
 * @param {Object} req - Express request object (mengandung id_category di params)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const { id_user } = req.user;
        const { id_category } = req.params;

        const category = await deleteCategoryService(id_category, id_user);

        return successResponse(res, category, "Category berhasil dihapus", 200);
    } catch (err) {
        return next(err);
    }
};