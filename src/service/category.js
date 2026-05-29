import { createCategory, getAllCategory, getCategoryById, updateCategory,deleteCategory } from "../models/category.js";
import { AppError } from "../utils/appError.js";

export const categoryService = async (id_user, nama_category, tipe) => {
    if (!id_user) {
        throw new Error("User tidak ditemukan");
    }

    if (!nama_category || nama_category.trim().length < 3) {
        throw new Error("Category harus diisi dan minimal 3 karakter");
    }

    if (!tipe || (tipe !== "pemasukan" && tipe !== "pengeluaran")) {
        throw new Error("Tipe harus diisi dan harus 'pemasukan' atau 'pengeluaran'");
    }

    const existing = await getAllCategory(id_user);
    const duplicate = existing.find(c => c.nama_category.toLowerCase() === nama_category.toLowerCase());
    if (duplicate) {
        throw new AppError("Nama category sudah ada", 409)
    }

    const newCategory = await createCategory(id_user, nama_category, tipe);

    if (!newCategory) {
        throw new Error("Category gagal dibuat");
    }

    return newCategory;
};

export const getAllCategoryService = async (id_user) => {
    if (!id_user) {
        throw new Error("User tidak ditemukan");
    }

    const category = await getAllCategory(id_user);
    return category;
}


export const getCategoryByIdService = async (id_category, id_user) => {
    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new Error("ID category tidak valid");
    }

    if (!id_user) {
        throw new Error("User tidak ditemukan");
    }

    const category = await getCategoryById(id_category, id_user);

    if (!category) {
        throw new AppError("Category tidak ditemukan", 404)
    }

    return category;
};

export const updateCategoryService = async (id_category, id_user, nama_category, tipe) => {
    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new Error("ID category tidak valid");
    }
     
    if (!id_user) {
        throw new Error("User tidak ditemukan");
    }
    
    if (!nama_category || nama_category.trim().length < 3) {
        throw new Error("Nama category minimal 3 karakter");
    }
    
    if (!tipe || (tipe !== "pemasukan" && tipe !== "pengeluaran")) {
        throw new Error("Tipe harus 'pemasukan' atau 'pengeluaran'");
    }
    
    const existingCategory = await getCategoryById(id_category, id_user);
    
    if (!existingCategory) {
        throw new AppError("Category tidak ditemukan", 404)
    }
    
    const category = await updateCategory(id_category, id_user, nama_category, tipe);
    
    if (!category) {
        throw new Error("Category gagal diupdate");
    }
    
    return category;
};


export const deleteCategoryService = async (id_category, id_user) => {
    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new Error("ID category tidak valid");
    }
    
    if (!id_user) {
        throw new Error("User tidak ditemukan");
    }
    
    const category = await deleteCategory(id_category, id_user);
    
    if (!category) {
        throw new AppError("Category tidak ditemukan atau sudah dihapus", 404)
    }
    
    return category;
};