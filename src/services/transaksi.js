import {
  createTransaksi,
  findAllTransaksi,
  findTransaksiById,
  countTransaksi,
  updateTransaksi,
  deleteTransaksi,
} from "../repositories/transaksi.js";

import { findCategoryById } from "../repositories/category.js";
import { findUserById } from "../repositories/auth.js";
import { AppError } from "../utils/appError.js";


export const createTransaksiService = async (userId, transaksiData) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  const category = await findCategoryById({
    id: transaksiData.categoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  const jumlah =
    category.tipe === "PENGELUARAN"
      ? -Math.abs(transaksiData.jumlah)
      : Math.abs(transaksiData.jumlah);

  return createTransaksi({
    userId,
    categoryId: transaksiData.categoryId,
    jumlah,
    deskripsi: transaksiData.deskripsi ?? null,
    tanggal: transaksiData.tanggal ?? new Date(),
  });
};


export const findAllTransaksiService = async (
  userId,
  { page = 1, limit = 10 }
) => {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const [transaksi, totalData] = await Promise.all([
    findAllTransaksi({
      userId,
      skip,
      take: limit,
    }),
    countTransaksi(userId),
  ]);

  return {
    pagination: {
      page,
      limit,
      totalData,
      totalPage: Math.ceil(totalData / limit),
    },
    data: transaksi,
  };
};


export const findTransaksiByIdService = async (
  transaksiId,
  userId
) => {
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


export const updateTransaksiService = async (
  transaksiId,
  userId,
  transaksiData
) => {
  const transaksi = await findTransaksiById({
    id: transaksiId,
    userId,
    isDeleted: false,
  });

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan", 404);
  }

  const updateCategoryId = transaksiData.categoryId ?? transaksi.categoryId;

  const category = await findCategoryById({
    id: updateCategoryId,
    userId,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError("Category tidak ditemukan", 404);
  }

  const updateData = {};

  if (transaksiData.categoryId !== undefined) {
    updateData.categoryId = transaksiData.categoryId;
  }

  if (transaksiData.jumlah !== undefined) {
    updateData.jumlah =
      category.tipe === "PENGELUARAN"
        ? -Math.abs(transaksiData.jumlah)
        : Math.abs(transaksiData.jumlah);
  }

  if (transaksiData.deskripsi !== undefined) {
    updateData.deskripsi = transaksiData.deskripsi;
  }

  if (transaksiData.tanggal !== undefined) {
    updateData.tanggal = transaksiData.tanggal;
  }

  return updateTransaksi(transaksiId, userId, updateData);
};

export const deleteTransaksiService = async (
  transaksiId,
  userId
) => {
  const transaksi = await findTransaksiById({
    id: transaksiId,
    userId,
    isDeleted: false,
  });

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan", 404);
  }

  return deleteTransaksi(transaksiId, userId);
};