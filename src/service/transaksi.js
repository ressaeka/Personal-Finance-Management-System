import { createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi, getDailyStats, getMonthlyStats, getCategoryStats, getSummary } from '../models/transaksi.js';
import { getCategoryById } from '../models/category.js';
import { AppError } from '../utils/appError.js';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const createTransaksiService = async (id_user, id_category, jumlah, deskripsi, tanggal, catatan) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) throw new AppError('User tidak valid/terautentikasi', 401);
  if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) throw new AppError('ID category tidak valid', 400);
  if (jumlah === undefined || jumlah === null || isNaN(jumlah)) throw new AppError('Jumlah harus berupa angka', 400);

  const category = await getCategoryById(id_category, id_user);
  if (!category) throw new AppError('Category tidak ditemukan', 404);

  let finalJumlah = category.tipe === 'pengeluaran' ? -Math.abs(jumlah) : Math.abs(jumlah);

  let finalTanggal;
  if (tanggal) {
    if (!DATE_REGEX.test(tanggal) || isNaN(new Date(tanggal + 'T00:00:00').getTime())) throw new AppError('Format tanggal tidak valid (YYYY-MM-DD)', 400);
    finalTanggal = tanggal;
  } else {
    finalTanggal = new Date();
  }

  const transaksi = await createTransaksi(id_user, id_category, finalJumlah, deskripsi || null, finalTanggal, catatan || null);
  if (!transaksi) throw new AppError('Transaksi gagal dibuat', 500);
  return transaksi;
};

export const getAllTransaksiService = async (id_user, limit = null) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) throw new AppError('User tidak valid/terautentikasi', 401);
  return await getAllTransaksi(id_user, limit);
};

export const getTransaksiByIdService = async (id_transaksi, id_user) => {
  if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) throw new AppError('ID transaksi tidak valid', 400);
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) throw new AppError('User tidak valid/terautentikasi', 401);
  const transaksi = await getTransaksiById(id_transaksi, id_user);
  if (!transaksi) throw new AppError('Transaksi tidak ditemukan', 404);
  return transaksi;
};

export const updateTransaksiService = async (id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, catatan) => {
  if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) throw new AppError('ID transaksi tidak valid', 400);
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) throw new AppError('User tidak valid/terautentikasi', 401);
  if (!id_category || !Number.isInteger(Number(id_category)) || Number(id_category) <= 0) throw new AppError('ID category tidak valid', 400);
  if (jumlah === undefined || jumlah === null || isNaN(jumlah)) throw new AppError('Jumlah harus berupa angka', 400);

  const existing = await getTransaksiById(id_transaksi, id_user);
  if (!existing) throw new AppError('Transaksi tidak ditemukan', 404);

  const category = await getCategoryById(id_category, id_user);
  if (!category) throw new AppError('Category tidak ditemukan', 404);

  let finalJumlah = category.tipe === 'pengeluaran' ? -Math.abs(jumlah) : Math.abs(jumlah);

  let finalTanggal;
  if (tanggal) {
    if (!DATE_REGEX.test(tanggal) || isNaN(new Date(tanggal + 'T00:00:00').getTime())) throw new AppError('Format tanggal tidak valid (YYYY-MM-DD)', 400);
    finalTanggal = tanggal;
  } else {
    finalTanggal = new Date();
  }

  const transaksi = await updateTransaksi(id_transaksi, id_user, id_category, finalJumlah, deskripsi || null, finalTanggal, catatan || null);
  if (!transaksi) throw new AppError('Transaksi gagal diupdate', 500);
  return transaksi;
};

export const deleteTransaksiService = async (id_transaksi, id_user) => {
  if (!id_transaksi || !Number.isInteger(Number(id_transaksi)) || Number(id_transaksi) <= 0) throw new AppError('ID transaksi tidak valid', 400);
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) throw new AppError('User tidak valid/terautentikasi', 401);
  const transaksi = await deleteTransaksi(id_transaksi, id_user);
  if (!transaksi) throw new AppError('Transaksi tidak ditemukan atau sudah dihapus', 404);
  return transaksi;
};

export const getStatsService = async (id_user, tahun, bulan) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) throw new AppError('User tidak valid/terautentikasi', 401);
  const [monthly, byCategory, summary, daily] = await Promise.all([
    getMonthlyStats(id_user, tahun || null, bulan || null),
    getCategoryStats(id_user, tahun || null, bulan || null),
    getSummary(id_user, tahun || null, bulan || null),
    getDailyStats(id_user, tahun, bulan),
  ]);
  return { monthly, byCategory, summary, daily };
};
