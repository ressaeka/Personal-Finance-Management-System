import { createCategory, getAllCategory } from "../models/category.js";

export const categoryService = async (id_user, nama_category, tipe) => {
    try {
        if (!id_user) {
            throw new Error("User tidak ditemukan");
        }

        if (!nama_category || nama_category.length < 3) {
            throw new Error("Category harus diisi dan minimal 3 karakter");
        }

        if (!tipe || (tipe !== "pemasukan" && tipe !== "pengeluaran")) {
            throw new Error("Tipe harus diisi dan harus 'pemasukan' atau 'pengeluaran'");
        }

        const newCategory = await createCategory(id_user, nama_category, tipe);

        if (!newCategory) {
            throw new Error("Category gagal dibuat");
        }

        console.log("Category berhasil dibuat:", newCategory);

        return newCategory;

    } catch (err) {
        throw err;
    }
};

export const getAllCategoryService = async (id_user) => {
    
    const category = await getAllCategory(id_user);

    return category ;
};