import {createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi} from "../models/transaksi.js";
import { getCategoryById } from "../models/category.js";

export const createTransaksiService = async (id_user, id_category, jumlah, deskripsi, tanggal) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new Error("User tidak valid");
  }

  if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
    throw new Error("ID category tidak valid");
  }

  if (jumlah === undefined || jumlah === null || isNaN(jumlah)) {
    throw new Error("Jumlah harus berupa angka");
  }

  const category = await getCategoryById(id_category, id_user);
  if (!category) {
    const err = new Error("Category tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  let finalJumlah;

  if (category.tipe === "pengeluaran") {
    finalJumlah = -Math.abs(jumlah);
  } else {
    finalJumlah = Math.abs(jumlah);
  }

  let finalTanggal;

  if (tanggal) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(tanggal) || isNaN(new Date(tanggal + "T00:00:00").getTime())) {
      throw new Error("Format tanggal tidak valid (YYYY-MM-DD)");
    }
    finalTanggal = tanggal;
  } else {
    finalTanggal = new Date();
  }

  const transaksi = await createTransaksi(
    id_user,
    id_category,
    finalJumlah,
    deskripsi || null,
    finalTanggal
  );

  if (!transaksi) {
    throw new Error("Transaksi gagal dibuat");
  }

  return transaksi;
};

export const getAllTransaksiService = async (id_user) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new Error("User tidak valid");
  }

  return await getAllTransaksi(id_user);
};

export const getTransaksiByIdService = async (id_transaksi, id_user) => {
  if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) {
    throw new Error("ID transaksi tidak valid");
  }

  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new Error("User tidak valid");
  }

  const transaksi = await getTransaksiById(id_transaksi, id_user);
  if (!transaksi) {
    const err = new Error("Transaksi tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  return transaksi;
};

export const updateTransaksiService = async (id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal) => {
  if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) {
    throw new Error("ID transaksi tidak valid");
  }

  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new Error("User tidak valid");
  }

  if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) {
    throw new Error("ID category tidak valid");
  }

  if (jumlah === undefined || jumlah === null || isNaN(jumlah)) {
    throw new Error("Jumlah harus berupa angka");
  }

  const existing = await getTransaksiById(id_transaksi, id_user);
  if (!existing) {
    const err = new Error("Transaksi tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  const category = await getCategoryById(id_category, id_user);
  if (!category) {
    const err = new Error("Category tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  let finalJumlah;
  if (category.tipe === "pengeluaran") {
    finalJumlah = -Math.abs(jumlah);
  } else {
    finalJumlah = Math.abs(jumlah);
  }

  let finalTanggal;
  if (tanggal) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(tanggal) || isNaN(new Date(tanggal + "T00:00:00").getTime())) {
      throw new Error("Format tanggal tidak valid (YYYY-MM-DD)");
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
    throw new Error("Transaksi gagal diupdate");
  }

  return transaksi;
};

export const deleteTransaksiService = async (id_transaksi, id_user) => {
  if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) {
    throw new Error("ID transaksi tidak valid");
  }

  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new Error("User tidak valid");
  }

  const transaksi = await deleteTransaksi(id_transaksi, id_user);
  if (!transaksi) {
    const err = new Error("Transaksi tidak ditemukan atau sudah dihapus");
    err.statusCode = 404;
    throw err;
  }

  return transaksi;
};