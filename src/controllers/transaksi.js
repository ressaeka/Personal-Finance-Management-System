import { createTransaksiService, getAllTransaksiService, getTransaksiByIdService, updateTransaksiService, deleteTransaksiService, getStatsService } from '../service/transaksi.js';
import { successResponse } from '../utils/response.js';

export const createTransaksi = async (req, res, next) => {
  try {
    const { id_category, jumlah, deskripsi, tanggal, catatan } = req.body;
    const { id_user } = req.user;
    const transaksi = await createTransaksiService(id_user, id_category, jumlah, deskripsi, tanggal, catatan);
    return successResponse(res, transaksi, 'Transaksi berhasil dibuat', 201);
  } catch (err) { return next(err); }
};

export const getAllTransaksi = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { limit } = req.query;
    const transaksi = await getAllTransaksiService(id_user, limit);
    return successResponse(res, { transaksi }, 'Berhasil mengambil semua transaksi', 200);
  } catch (err) { return next(err); }
};

export const getTransaksiById = async (req, res, next) => {
  try {
    const { id_transaksi } = req.params;
    const { id_user } = req.user;
    const transaksi = await getTransaksiByIdService(id_transaksi, id_user);
    return successResponse(res, { transaksi }, 'Berhasil mengambil transaksi', 200);
  } catch (err) { return next(err); }
};

export const updateTransaksi = async (req, res, next) => {
  try {
    const { id_category, jumlah, deskripsi, tanggal, catatan } = req.body;
    const { id_user } = req.user;
    const { id_transaksi } = req.params;
    const transaksi = await updateTransaksiService(id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, catatan);
    return successResponse(res, transaksi, 'Berhasil update transaksi', 200);
  } catch (err) { return next(err); }
};

export const deleteTransaksi = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { id_transaksi } = req.params;
    const transaksi = await deleteTransaksiService(id_transaksi, id_user);
    return successResponse(res, transaksi, 'Transaksi berhasil dihapus', 200);
  } catch (err) { return next(err); }
};

export const getStats = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { tahun, bulan } = req.query;
    const stats = await getStatsService(id_user, tahun, bulan);
    return successResponse(res, stats, 'Berhasil mengambil statistik', 200);
  } catch (err) { return next(err); }
};
