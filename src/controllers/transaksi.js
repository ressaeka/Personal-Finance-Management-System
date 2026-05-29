import { createTransaksiService, getAllTransaksiService, getTransaksiByIdService, updateTransaksiService, deleteTransaksiService } from "../service/transaksi.js";
import { successResponse } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

/**
 * Controller untuk mencatat transaksi baru (pemasukan/pengeluaran) milik user
 * @param {Object} req - Express request object (mengandung id_category, jumlah, deskripsi, tanggal di body)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const createTransaksi = async (req, res, next) => {
    try {
        const { id_category, jumlah, deskripsi, tanggal } = req.body;
        const { id_user } = req.user;

        const transaksi = await createTransaksiService(id_user, id_category, jumlah, deskripsi, tanggal);

        return successResponse(res, transaksi, "Transaksi berhasil dibuat", 201);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk mengambil seluruh riwayat transaksi milik user yang login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const getAllTransaksi = async (req, res, next) => {
    try {
        const { id_user } = req.user;
        const transaksi = await getAllTransaksiService(id_user);

        return successResponse(res, { transaksi }, "Berhasil mengambil semua transaksi", 200);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk mengambil satu detail transaksi berdasarkan ID transaksi
 * @param {Object} req - Express request object (mengandung id_transaksi di params)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const getTransaksiById = async (req, res, next) => {
    try {
        const { id_transaksi } = req.params;
        const { id_user } = req.user;

        const transaksi = await getTransaksiByIdService(id_transaksi, id_user);

        return successResponse(res, { transaksi }, "Berhasil mengambil transaksi", 200);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk memperbarui data transaksi berdasarkan ID transaksi
 * @param {Object} req - Express request object (mengandung id_transaksi di params dan data baru di body)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const updateTransaksi = async (req, res, next) => {
    try {
        const { id_category, jumlah, deskripsi, tanggal } = req.body;
        const { id_user } = req.user;
        const { id_transaksi } = req.params;

        const transaksi = await updateTransaksiService(id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal);

        return successResponse(res, transaksi, "Berhasil update transaksi", 200);
    } catch (err) {
        return next(err);
    }
};

/**
 * Controller untuk menghapus data transaksi berdasarkan ID transaksi
 * @param {Object} req - Express request object (mengandung id_transaksi di params)
 * @param {Object} res - Express response object
 * @param {Object} next - Express next function
 */
export const deleteTransaksi = async (req, res, next) => {
    try {
        const { id_user } = req.user;
        const { id_transaksi } = req.params;

        const transaksi = await deleteTransaksiService(id_transaksi, id_user);

        return successResponse(res, transaksi, "Transaksi berhasil dihapus", 200);
    } catch (err) {
        return next(err);
    }
};