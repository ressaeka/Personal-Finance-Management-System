import {
  createTransaksiService,
  findAllTransaksiService,
  findTransaksiByIdService,
  updateTransaksiService,
  deleteTransaksiService,
} from "../service/transaksi.js";

import { successResponse } from "../utils/response.js";


export const createTransaksi = async (req, res, next) => {
  try {
    const transaksi = await createTransaksiService(
      req.user.id,
      req.body
    );

    return successResponse(
      res,
      transaksi,
      "Transaksi berhasil dibuat",
      201
    );
  } catch (err) {
    next(err);
  }
};


export const findAllTransaksi = async (req, res, next) => {
  try {
    const transaksi = await findAllTransaksiService(
      req.user.id,
      {
        page: req.query.page,
        limit: req.query.limit,
      }
    );

    return successResponse(
      res,
      transaksi,
      "Berhasil mengambil semua transaksi",
      200
    );
  } catch (err) {
    next(err);
  }
};

export const findTransaksiById = async (req, res, next) => {
  try {
    const transaksi = await findTransaksiByIdService(
      Number(req.params.id),
      req.user.id
    );

    return successResponse(
      res,
      transaksi,
      "Berhasil mengambil transaksi",
      200
    );
  } catch (err) {
    next(err);
  }
};


export const updateTransaksi = async (req, res, next) => {
  try {
    const transaksi = await updateTransaksiService(
      Number(req.params.id),
      req.user.id,
      req.body
    );

    return successResponse(
      res,
      transaksi,
      "Berhasil mengupdate transaksi",
      200
    );
  } catch (err) {
    next(err);
  }
};


export const deleteTransaksi = async (req, res, next) => {
  try {
    const transaksi = await deleteTransaksiService(
      Number(req.params.id),
      req.user.id
    );

    return successResponse(
      res,
      transaksi,
      "Transaksi berhasil dihapus",
      200
    );
  } catch (err) {
    next(err);
  }
};