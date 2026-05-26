import { createCategory, getAllCategory, getCategoryById, updateCategory,deleteCategory } from "../models/category.js";

export const categoryService = async (id_user, nama_category, tipe) => {
    try {
        if (!id_user) {
            throw new Error("User tidak ditemukan");
        }

        if (!nama_category || nama_category.trim().length < 3) {
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
        throw new Error("Category tidak ditemukan");
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
        throw new Error("Category tidak ditemukan");
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
        throw new Error("Category tidak ditemukan atau sudah dihapus");
    }
    
    return category;
};