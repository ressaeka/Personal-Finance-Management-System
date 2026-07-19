import { createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi } from "../repositories/transaksi.js";
import { findCategoryById } from "../repositories/category.js";
import { findUserById } from "../repositories/auth.js";
import { AppError } from "../utils/appError.js";

export const createTransaksiService = async (userId, transaksiData) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User tidak ditemukan", 401);
  }

  const category = await getCategoryById(
    transaksiData.id_category,
    userId
  );

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  const jumlah = category.tipe === "pengeluaran"
      ? -Math.abs(transaksiData.jumlah)
      : Math.abs(transaksiData.jumlah);

  return await createTransaksi({
    id_user: userId,
    id_category: transaksiData.id_category,
    jumlah,
    deskripsi: transaksiData.deskripsi ?? null,
    tanggal: transaksiData.tanggal ?? new Date(),
  });
};

export const getAllTransaksiService = async (userId) => {
  return await getAllTransaksi(userId);
};

export const getTransaksiByIdService = async ( transaksiId, userId ) => {
  const transaksi = await getTransaksiById(
    transaksiId,
    userId
  );

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan", 404);
  }

  return transaksi;
};

export const updateTransaksiService = async ( transaksiId, userId, transaksiData ) => {
  const transaksi = await getTransaksiById(
    transaksiId,
    userId
  );

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan", 404);
  }

  const category = await findCategoryById(
    transaksiData.id_category,
    userId
  );

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  const jumlah = category.tipe === "pengeluaran"
      ? -Math.abs(transaksiData.jumlah)
      : Math.abs(transaksiData.jumlah);

  return await updateTransaksi(transaksiId, {
    id_category: transaksiData.id_category,
    jumlah,
    deskripsi: transaksiData.deskripsi ?? transaksi.deskripsi,
    tanggal: transaksiData.tanggal ?? transaksi.tanggal,
  });
};

export const deleteTransaksiService = async ( transaksiId, userId ) => {
  const transaksi = await getTransaksiById(
    transaksiId,
    userId
  );

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan", 404);
  }

  return await deleteTransaksi(transaksiId);
};