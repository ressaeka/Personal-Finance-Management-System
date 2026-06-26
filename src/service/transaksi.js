import { createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi } from "../models/transaksi.js";
import { getCategoryById } from "../models/category.js";
import { findUserById } from "../models/auth.js";
import { AppError } from "../utils/appError.js";
import { validateCreateTransaksi, validateGetTransaksiById, validateGetAllTransaksi, validateUpdateTransaksi, validateDeleteTransaksi } from "../validators/transaksi.js";

export const createTransaksiService = async (id_user, id_category, jumlah, deskripsi, tanggal) => {
  const validatedData = await validateCreateTransaksi( findUserById, getCategoryById, id_user, id_category, jumlah, deskripsi, tanggal);

  const transaksi = await createTransaksi(
    validatedData.id_user,
    validatedData.id_category,
    validatedData.jumlah,
    validatedData.deskripsi,
    validatedData.tanggal,
  );

  if (!transaksi) {
    throw new AppError("Transaksi gagal dibuat", 500);
  }

  return transaksi;
};

export const getAllTransaksiService = async (id_user) => {
  const userId = await validateGetAllTransaksi(findUserById, id_user);
  return await getAllTransaksi(userId);
};

export const getTransaksiByIdService = async (id_transaksi, id_user) => {
  const { transaksi } = await validateGetTransaksiById(
    getTransaksiById,
    id_transaksi,
    id_user,
    findUserById,
  );

  return transaksi;
};

export const updateTransaksiService = async (id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal) => {
  const validatedData = await validateUpdateTransaksi(
    findUserById,
    getTransaksiById,
    getCategoryById,
    id_transaksi,
    id_user,
    id_category,
    jumlah,
    deskripsi,
    tanggal,
  );

  const transaksi = await updateTransaksi(
    validatedData.id_transaksi,
    validatedData.id_user,
    validatedData.id_category,
    validatedData.jumlah,
    validatedData.deskripsi,
    validatedData.tanggal,
  );

  if (!transaksi) {
    throw new AppError("Transaksi gagal diupdate", 500);
  }

  return transaksi;
};

export const deleteTransaksiService = async (id_transaksi, id_user) => {
  const validatedData = await validateDeleteTransaksi(
    findUserById,
    getTransaksiById,
    id_transaksi,
    id_user,
  );

  const transaksi = await deleteTransaksi(validatedData.id_transaksi, validatedData.id_user);

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan atau sudah dihapus", 404);
  }

  return transaksi;
};
