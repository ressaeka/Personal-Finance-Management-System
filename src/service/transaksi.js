import { createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi } from "../models/transaksi.js";
import { getCategoryById } from "../models/category.js";
import { AppError } from "../utils/appError.js";

// --- REUSABLE REGEX CONSTANTS ---
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Service untuk mencatat transaksi keuangan baru (Pemasukan/Pengeluaran)
 * @param {number|string} id_user - ID user yang melakukan transaksi
 * @param {number|string} id_category - ID kategori yang dipilih
 * @param {number} jumlah - Nominal transaksi
 * @param {string} [deskripsi] - Catatan tambahan transaksi (opsional)
 * @param {string} [tanggal] - Tanggal transaksi format YYYY-MM-DD (opsional)
 * @returns {Object} Data transaksi baru yang berhasil disimpan
 */
export const createTransaksiService = async (id_user, id_category, jumlah, deskripsi, tanggal) => {
    // --- VALIDASI INPUT DASAR (400 Bad Request / 401 Unauthorized) ---
    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new AppError("User tidak valid/terautentikasi", 401);
    }

    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new AppError("ID category tidak valid", 400);
    }

    if (jumlah === undefined || jumlah === null || isNaN(jumlah)) {
        throw new AppError("Jumlah harus berupa angka", 400);
    }

    // Memastikan Kategori Terdaftar dan Milik User yang Bersangkutan
    const category = await getCategoryById(id_category, id_user);
    if (!category) {
        throw new AppError("Category tidak ditemukan", 404); // 404 Not Found
    }

    // Otomatisasi Nilai: Jika pengeluaran, paksa nominal menjadi negatif di database
    let finalJumlah;
    if (category.tipe === "pengeluaran") {
        finalJumlah = -Math.abs(jumlah);
    } else {
        finalJumlah = Math.abs(jumlah);
    }

    // Validasi Format Tanggal Jika User Menginput Tanggal Kustom
    let finalTanggal;
    if (tanggal) {
        if (!DATE_REGEX.test(tanggal) || isNaN(new Date(tanggal + "T00:00:00").getTime())) {
            throw new AppError("Format tanggal tidak valid (YYYY-MM-DD)", 400);
        }
        finalTanggal = tanggal;
    } else {
        finalTanggal = new Date(); // Default ke tanggal hari ini
    }

    const transaksi = await createTransaksi(
        id_user,
        id_category,
        finalJumlah,
        deskripsi || null,
        finalTanggal
    );

    if (!transaksi) {
        throw new AppError("Transaksi gagal dibuat", 500);
    }

    return transaksi;
};

/**
 * Service untuk mengambil semua riwayat transaksi milik user
 * @param {number|string} id_user - ID user pemilik transaksi
 * @returns {Array<Object>} Daftar array seluruh transaksi user
 */
export const getAllTransaksiService = async (id_user) => {
    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new AppError("User tidak valid/terautentikasi", 401);
    }

    return await getAllTransaksi(id_user);
};

/**
 * Service untuk melihat detail satu transaksi berdasarkan ID
 * @param {number|string} id_transaksi - ID transaksi yang dicari
 * @param {number|string} id_user - ID user pemilik transaksi
 * @returns {Object} Detail objek data transaksi tunggal
 */
export const getTransaksiByIdService = async (id_transaksi, id_user) => {
    if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) {
        throw new AppError("ID transaksi tidak valid", 400);
    }

    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new AppError("User tidak valid/terautentikasi", 401);
    }

    const transaksi = await getTransaksiById(id_transaksi, id_user);
    if (!transaksi) {
        throw new AppError("Transaksi tidak ditemukan", 404); // 404 Not Found
    }

    return transaksi;
};

/**
 * Service untuk memperbarui data transaksi yang sudah ada
 * @param {number|string} id_transaksi - ID transaksi yang akan diubah
 * @param {number|string} id_user - ID user pemilik transaksi
 * @param {number|string} id_category - ID kategori baru/lama
 * @param {number} jumlah - Nominal baru/lama
 * @param {string} [deskripsi] - Catatan baru/lama (opsional)
 * @param {string} [tanggal] - Tanggal baru/lama format YYYY-MM-DD (opsional)
 * @returns {Object} Data transaksi yang telah berhasil diperbarui
 */
export const updateTransaksiService = async (id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal) => {
    // --- VALIDASI INPUT DASAR (400 Bad Request / 401 Unauthorized) ---
    if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) {
        throw new AppError("ID transaksi tidak valid", 400);
    }

    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new AppError("User tidak valid/terautentikasi", 401);
    }

    if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
        throw new AppError("ID category tidak valid", 400);
    }

    if (jumlah === undefined || jumlah === null || isNaN(jumlah)) {
        throw new AppError("Jumlah harus berupa angka", 400);
    }

    // Memastikan Transaksi Memang Ada Sebelum Diupdate
    const existing = await getTransaksiById(id_transaksi, id_user);
    if (!existing) {
        throw new AppError("Transaksi tidak ditemukan", 404);
    }

    // Memastikan Kategori Baru/Lama Terdaftar di Akun User
    const category = await getCategoryById(id_category, id_user);
    if (!category) {
        throw new AppError("Category tidak ditemukan", 404);
    }

    // Hitung Ulang Tipe Jumlah (Plus/Minus) Berdasarkan Kategori Terbaru
    let finalJumlah;
    if (category.tipe === "pengeluaran") {
        finalJumlah = -Math.abs(jumlah);
    } else {
        finalJumlah = Math.abs(jumlah);
    }

    // Validasi Format Tanggal Baru
    let finalTanggal;
    if (tanggal) {
        if (!DATE_REGEX.test(tanggal) || isNaN(new Date(tanggal + "T00:00:00").getTime())) {
            throw new AppError("Format tanggal tidak valid (YYYY-MM-DD)", 400);
        }
        finalTanggal = tanggal;
    } else {
        finalTanggal = new Date();
    }

    const transaksi = await updateTransaksi(
        id_transaksi,
        id_user,
        id_category,
        finalJumlah,
        deskripsi || null,
        finalTanggal
    );

    if (!transaksi) {
        throw new AppError("Transaksi gagal diupdate", 500);
    }

    return transaksi;
};

/**
 * Service untuk menghapus transaksi berdasarkan ID
 * @param {number|string} id_transaksi - ID transaksi yang akan dihapus
 * @param {number|string} id_user - ID user pemilik transaksi
 * @returns {Object} Data transaksi yang berhasil dihapus sebagai bukti konfirmasi
 */
export const deleteTransaksiService = async (id_transaksi, id_user) => {
    if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) {
        throw new AppError("ID transaksi tidak valid", 400);
    }

    if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
        throw new AppError("User tidak valid/terautentikasi", 401);
    }

    const transaksi = await deleteTransaksi(id_transaksi, id_user);
    if (!transaksi) {
        throw new AppError("Transaksi tidak ditemukan atau sudah dihapus", 404);
    }

    return transaksi;
};