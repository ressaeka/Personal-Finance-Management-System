import {
  createTransaksi,
  findAllTransaksi,
  findTransaksiById,
  countTransaksi,
  updateTransaksi,
  deleteTransaksi,
} from "../repositories/transaksi.js";

import { findCategoryById } from "../repositories/category.js";
import { AppError } from "../utils/appError.js";

const normalizeAmount = (tipe, jumlah) =>
  tipe === "PENGELUARAN"
    ? -Math.abs(jumlah)
    : Math.abs(jumlah);

const getExistingTransaction = async (transaksiId, userId) => {
  const transaksi = await findTransaksiById({
    id: transaksiId,
    userId,
    isDeleted: false,
  });

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan", 404);
  }

  return transaksi;
};


export const createTransaksiService = async ( userId, transaksiData ) => {
  const category = await findCategoryById({
    id: transaksiData.categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  return createTransaksi({
    userId,
    categoryId: transaksiData.categoryId,
    jumlah: normalizeAmount(
      category.tipe,
      transaksiData.jumlah
    ),
    deskripsi: transaksiData.deskripsi ?? null,
    tanggal: transaksiData.tanggal ?? new Date(),
  });
};


export const findAllTransaksiService = async ( userId, { page = 1, limit = 10 } = {} ) => {
  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.max(1, Number(limit) || 10);

  const skip = (pageNumber - 1) * limitNumber;

  const [transaksi, totalData] = await Promise.all([
    findAllTransaksi({
      userId,
      skip,
      take: limitNumber,
    }),
    countTransaksi(userId),
  ]);

  return {
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalData,
      totalPages: Math.ceil(
        totalData / limitNumber
      ),
    },
    data: transaksi,
  };
};



export const findTransaksiByIdService = async ( transaksiId, userId ) => {
  return getExistingTransaction(
    transaksiId,
    userId
  );
};


export const updateTransaksiService = async ( transaksiId, userId, transaksiData ) => {
  const transaksi =
    await getExistingTransaction(
      transaksiId,
      userId
    );

  const categoryId =
    transaksiData.categoryId ??
    transaksi.categoryId;

  const category = await findCategoryById({
    id: categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  const updateData = {};

  if (transaksiData.categoryId !== undefined) {
    updateData.categoryId =
      transaksiData.categoryId;
  }

  if (transaksiData.jumlah !== undefined) {
    updateData.jumlah = normalizeAmount(
      category.tipe,
      transaksiData.jumlah
    );
  }

  if (transaksiData.deskripsi !== undefined) {
    updateData.deskripsi =
      transaksiData.deskripsi;
  }

  if (transaksiData.tanggal !== undefined) {
    updateData.tanggal =
      transaksiData.tanggal;
  }

  return updateTransaksi(
    transaksiId,
    userId,
    updateData
  );
};


export const deleteTransaksiService = async ( transaksiId, userId ) => {
  await getExistingTransaction(
    transaksiId,
    userId
  );

  return deleteTransaksi(
    transaksiId,
    userId
  );
};