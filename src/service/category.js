import { createCategory, getAllCategory, getCategoryById, updateCategory, deleteCategory } from "../models/category.js";
import { AppError } from "../utils/appError.js";

/**
 * Service untuk membuat kategori keuangan baru bagi user
 * @param {number|string} id_user - ID user pemilik kategori
 * @param {string} nama_category - Nama kategori baru yang ingin dibuat
 * @param {string} tipe - Jenis kategori ('pemasukan' atau 'pengeluaran')
 * @returns {Object} Data kategori baru yang berhasil disimpan di database
 */
export const categoryService = async (id_user, nama_category, tipe) => {
    if (!id_user) {
        throw new AppError("User tidak ditemukan/terautentikasi", 401); // 401 Unauthorized
    }

    if (!nama_category || nama_category.trim().length < 3) {
        throw new AppError("Category harus diisi dan minimal 3 karakter", 400); // 400 Bad Request
    }

    if (!tipe || (tipe !== "pemasukan" && tipe !== "pengeluaran")) {
        throw new AppError("Tipe harus diisi dan harus 'pemasukan' atau 'pengeluaran'", 400); // 400 Bad Request
    }

    // Pengecekan duplikasi nama kategori untuk user yang sama (Case-Insensitive)
    const existing = await getAllCategory(id_user);
    const duplicate = existing.find(c => c.nama_category.toLowerCase() === nama_category.toLowerCase());
    if (duplicate) {
        throw new AppError("Nama category sudah ada", 409); // 409 Conflict
    }

    const newCategory = await createCategory(id_user, nama_category, tipe);

    if (!newCategory) {
        throw new AppError("Category gagal dibuat", 500);
    }

    return newCategory;
};

/**
 * Service untuk mengambil seluruh daftar kategori milik user tertentu
 * @param {number|string} id_user - ID user yang bersangkutan
 * @returns {Array<Object>} Daftar array berisi objek-objek kategori user
 */
export const getAllCategoryService = async (id_user) => {
    if (!id_user) {
        throw new AppError("User tidak ditemukan/terautentikasi", 401); // 401 Unauthorized
    }

    const category = await getAllCategory(id_user);
    return category;
};

/**
 * Service untuk mengambil data detail kategori berdasarkan ID kategori dan ID user
 * @param {number|string} id_category - ID kategori yang dicari
 * @param {number|string} id_user - ID user pemilik kategori (untuk proteksi data)
 * @returns {Object} Objek data detail kategori tunggal
 */
export const getCategoryByIdService = async (id_category, id_user) => {
    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new AppError("ID category tidak valid", 400); // 400 Bad Request
    }

    if (!id_user) {
        throw new AppError("User tidak ditemukan/terautentikasi", 401); // 401 Unauthorized
    }

    const category = await getCategoryById(id_category, id_user);

    if (!category) {
        throw new AppError("Category tidak ditemukan", 404); // 404 Not Found
    }

    return category;
};

/**
 * Service untuk mengubah data kategori yang sudah ada
 * @param {number|string} id_category - ID kategori yang akan diubah
 * @param {number|string} id_user - ID user pemilik kategori
 * @param {string} nama_category - Nama kategori baru hasil pembaruan
 * @param {string} tipe - Jenis kategori baru ('pemasukan' atau 'pengeluaran')
 * @returns {Object} Objek data kategori yang telah berhasil diperbarui
 */
export const updateCategoryService = async (id_category, id_user, nama_category, tipe) => {
    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new AppError("ID category tidak valid", 400); // 400 Bad Request
    }
      
    if (!id_user) {
        throw new AppError("User tidak ditemukan", 401); // 401 Unauthorized
    }
    
    if (!nama_category || nama_category.trim().length < 3) {
        throw new AppError("Nama category minimal 3 karakter", 400); // 400 Bad Request
    }
    
    if (!tipe || (tipe !== "pemasukan" && tipe !== "pengeluaran")) {
        throw new AppError("Tipe harus 'pemasukan' atau 'pengeluaran'", 400); // 400 Bad Request
    }
    
    // Memastikan kategori yang mau diubah memang milik user tersebut
    const existingCategory = await getCategoryById(id_category, id_user);
    if (!existingCategory) {
        throw new AppError("Category tidak ditemukan", 404); // 404 Not Found
    }
    
    const category = await updateCategory(id_category, id_user, nama_category, tipe);
    
    if (!category) {
        throw new AppError("Category gagal diupdate", 500);
    }
    
    return category;
};

/**
 * Service untuk menghapus kategori keuangan tertentu milik user
 * @param {number|string} id_category - ID kategori yang akan dihapus
 * @param {number|string} id_user - ID user pemilik kategori
 * @returns {Object} Data kategori yang berhasil dihapus sebagai konfirmasi
 */
export const deleteCategoryService = async (id_category, id_user) => {
    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new AppError("ID category tidak valid", 400); // 400 Bad Request
    }
    
    if (!id_user) {
        throw new AppError("User tidak ditemukan/terautentikasi", 401); // 401 Unauthorized
    }

    const category = await deleteCategory(id_category, id_user);
    
    if (!category) {
        throw new AppError("Category tidak ditemukan atau sudah dihapus", 404); // 404 Not Found
    }
    
    return category;
};