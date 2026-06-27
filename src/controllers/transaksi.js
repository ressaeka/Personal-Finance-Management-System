import { createTransaksiService, getAllTransaksiService, getTransaksiByIdService, updateTransaksiService, deleteTransaksiService } from "../service/transaksi.js";
import { successResponse } from "../utils/response.js";

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

export const getAllTransaksi = async (req, res, next) => {
  try {
    const { id_user } = req.user;

    const transaksi = await getAllTransaksiService(id_user);

    return successResponse(res, { transaksi }, "Berhasil mengambil semua transaksi");
  } catch (err) {
    return next(err);
  }
};

export const getTransaksiById = async (req, res, next) => {
  try {
    const { id_transaksi } = req.params;
    const { id_user } = req.user;

    const transaksi = await getTransaksiByIdService(id_transaksi, id_user);

    return successResponse(res, { transaksi }, "Berhasil mengambil transaksi");
  } catch (err) {
    return next(err);
  }
};

export const updateTransaksi = async (req, res, next) => {
  try {
    const { id_category, jumlah, deskripsi, tanggal } = req.body;
    const { id_user } = req.user;
    const { id_transaksi } = req.params;

    const transaksi = await updateTransaksiService(id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal);

    return successResponse(res, transaksi, "Berhasil update transaksi");
  } catch (err) {
    return next(err);
  }
};

export const deleteTransaksi = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { id_transaksi } = req.params;

    const transaksi = await deleteTransaksiService(id_transaksi, id_user);

    return successResponse(res, transaksi, "Transaksi berhasil dihapus");
  } catch (err) {
    return next(err);
  }
};
