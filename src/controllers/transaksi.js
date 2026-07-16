import { createTransaksiService, getAllTransaksiService, getTransaksiByIdService, updateTransaksiService, deleteTransaksiService } from "../service/transaksi.js";
import { successResponse } from "../utils/response.js";

export const createTransaksi = async (req, res, next) => {
  try {
    const transaksi = await createTransaksiService(
      req.user.id,
      req.body
    );

    return successResponse( res, transaksi, "Transaksi berhasil dibuat", 201 );
  } catch (err) {
    next(err);
  }
};

export const getAllTransaksi = async (req, res, next) => {
  try {
    const transaksi = await getAllTransaksiService(req.user.id);

    return successResponse( res, transaksi, "Berhasil mengambil semua transaksi");
  } catch (err) {
    next(err);
  }
};

export const getTransaksiById = async (req, res, next) => {
  try {
    const transaksi = await getTransaksiByIdService(
      Number(req.params.id_transaksi),
      req.user.id
    );

    return successResponse( res, transaksi, "Berhasil mengambil transaksi" );
  } catch (err) {
    next(err);
  }
};

export const updateTransaksi = async (req, res, next) => {
  try {
    const transaksi = await updateTransaksiService(
      Number(req.params.id_transaksi),
      req.user.id,
      req.body
    );

    return successResponse( res, transaksi, "Berhasil mengupdate transaksi" );
  } catch (err) {
    next(err);
  }
};

export const deleteTransaksi = async (req, res, next) => {
  try {
    const transaksi = await deleteTransaksiService(
      Number(req.params.id_transaksi),
      req.user.id
    );

    return successResponse( res, transaksi, "Transaksi berhasil dihapus");
  } catch (err) {
    next(err);
  }
};