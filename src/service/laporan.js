import {
  getAllLaporan,
  getLaporanByPeriode,
  generateLaporanBulanan,
  rekapOtomatis,
  deleteLaporan,
} from '../models/laporan.js';
import { AppError } from '../utils/appError.js';

// --- REUSABLE REGEX CONSTANTS ---
const PERIODE_REGEX = /^\d{4}-\d{2}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Service untuk men-generate laporan bulanan berdasarkan tahun dan bulan
 * @param {number|string} id_user - ID user pemilik laporan
 * @param {number|string} tahun - Tahun laporan (format: YYYY)
 * @param {number|string} bulan - Bulan laporan (format: 1-12)
 * @returns {Object} Data laporan keuangan bulanan yang berhasil di-generate
 */
export const generateLaporanService = async (id_user, tahun, bulan) => {
  // Validasi Format User (401 Unauthorized)
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('User tidak valid/terautentikasi', 401);
  }

  // Validasi Kelengkapan Input Periode (400 Bad Request)
  if (!tahun || !bulan) {
    throw new AppError('Tahun dan bulan harus diisi', 400);
  }

  const tahunNum = parseInt(tahun);
  const bulanNum = parseInt(bulan);

  if (isNaN(tahunNum) || tahunNum < 2000 || tahunNum > 2100) {
    throw new AppError('Tahun tidak valid (Rentang valid: 2000-2100)', 400);
  }

  if (isNaN(bulanNum) || bulanNum < 1 || bulanNum > 12) {
    throw new AppError('Bulan tidak valid (Rentang valid: 1-12)', 400);
  }

  const laporan = await generateLaporanBulanan(id_user, tahunNum, bulanNum);
  if (!laporan) {
    throw new AppError('Internal Server Error', 500); // 500 Internal Server Error
  }

  return laporan;
};

/**
 * Service untuk mengambil semua daftar laporan keuangan milik user
 * @param {number|string} id_user - ID user yang bersangkutan
 * @returns {Array<Object>} Daftar riwayat seluruh laporan user
 */
export const getAllLaporanService = async (id_user) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('User tidak valid/terautentikasi', 401);
  }

  return await getAllLaporan(id_user);
};

/**
 * Service untuk mengambil data laporan keuangan berdasarkan periode tertentu
 * @param {number|string} id_user - ID user pemilik laporan
 * @param {string} periode - Periode yang dicari (format: YYYY-MM)
 * @returns {Object} Data detail laporan pada periode tersebut
 */
export const getLaporanByPeriodeService = async (id_user, periode) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('User tidak valid/terautentikasi', 401);
  }

  if (!periode) {
    throw new AppError('Periode harus diisi', 400);
  }

  if (!PERIODE_REGEX.test(periode)) {
    throw new AppError('Format periode tidak valid (YYYY-MM)', 400);
  }

  const laporan = await getLaporanByPeriode(id_user, periode);
  if (!laporan) {
    throw new AppError('Laporan tidak ditemukan', 404); // 404 Not Found
  }

  return laporan;
};

/**
 * Service untuk melakukan rekap otomatis total pemasukan/pengeluaran berdasarkan tanggal transaksi
 * @param {number|string} id_user - ID user pemilik laporan
 * @param {string} tanggal - Tanggal transaksi untuk rekap (format: YYYY-MM-DD)
 * @returns {Object} Data laporan yang berhasil diperbarui nilainya
 */
export const rekapOtomatisService = async (id_user, tanggal) => {
  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('User tidak valid/terautentikasi', 401);
  }

  if (!tanggal) {
    throw new AppError('Tanggal harus diisi', 400);
  }

  if (
    !DATE_REGEX.test(tanggal) ||
    isNaN(new Date(tanggal + 'T00:00:00').getTime())
  ) {
    throw new AppError('Format tanggal tidak valid (YYYY-MM-DD)', 400);
  }

  const updated = await rekapOtomatis(id_user, tanggal);
  return updated;
};

/**
 * Service untuk menghapus dokumen laporan tertentu
 * @param {number|string} id_laporan - ID laporan yang ingin dihapus
 * @param {number|string} id_user - ID user pemilik laporan
 * @returns {Object} Data laporan yang berhasil dihapus sebagai bukti konfirmasi
 */
export const deleteLaporanService = async (id_laporan, id_user) => {
  if (
    !id_laporan ||
    !Number.isInteger(Number(id_laporan)) ||
    Number(id_laporan) <= 0
  ) {
    throw new AppError('ID laporan tidak valid', 400);
  }

  if (!id_user || !Number.isInteger(Number(id_user)) || Number(id_user) <= 0) {
    throw new AppError('User tidak valid/terautentikasi', 401);
  }

  const laporan = await deleteLaporan(id_laporan, id_user);
  if (!laporan) {
    throw new AppError('Laporan tidak ditemukan', 404); // 404 Not Found
  }

  return laporan;
};
