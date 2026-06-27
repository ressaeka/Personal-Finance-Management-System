import {
  getDashboardStats,
  getMonthlyReport,
  getCategoryReportCurrentMonth,
  generateSummary,
  createLaporan,
  getAllLaporan,
  getLaporanById,
  updateLaporan,
  deleteLaporan,
} from "../models/laporan.js";
import { findUserById } from "../models/auth.js";
import { AppError } from "../utils/appError.js";
import {
  validateDashboardStats,
  validateMonthlyReport,
  validateCategoryReport,
  validateCreateLaporan,
  validateGetAllLaporan,
  validateGetLaporanById,
  validateUpdateLaporan,
  validateDeleteLaporan,
} from "../validators/laporan.js";

export const getDashboardStatsService = async (userId) => {
  const validUserId = validateDashboardStats(userId);
  const stats = await getDashboardStats(validUserId);
  return stats;
};

export const getMonthlyReportService = async (userId) => {
  const validUserId = validateMonthlyReport(userId);
  const report = await getMonthlyReport(validUserId);
  return report;
};

export const getCategoryReportCurrentMonthService = async (userId, tipe = null) => {
  const validUserId = validateCategoryReport(userId);
  const report = await getCategoryReportCurrentMonth(validUserId, tipe);
  return report;
};

export const createLaporanService = async (id_user, periode, tanggal_awal, tanggal_akhir) => {
  const validated = await validateCreateLaporan(findUserById, id_user, periode, tanggal_awal, tanggal_akhir);
  const summary = await generateSummary(validated.id_user, validated.tanggal_awal, validated.tanggal_akhir);

  const laporan = await createLaporan(
    validated.id_user,
    validated.periode,
    validated.tanggal_awal,
    validated.tanggal_akhir,
    summary.total_pemasukan,
    summary.total_pengeluaran,
    summary.saldo,
  );

  if (!laporan) {
    throw new AppError('Laporan gagal dibuat', 500);
  }

  return laporan;
};

export const getAllLaporanService = async (id_user) => {
  const userId = await validateGetAllLaporan(findUserById, id_user);
  return getAllLaporan(userId);
};

export const getLaporanByIdService = async (id_laporan, id_user) => {
  const { laporan } = await validateGetLaporanById(getLaporanById, id_laporan, id_user, findUserById);
  return laporan;
};

export const updateLaporanService = async (id_laporan, id_user, periode, tanggal_awal, tanggal_akhir) => {
  const validated = await validateUpdateLaporan(findUserById, getLaporanById, id_laporan, id_user, periode, tanggal_awal, tanggal_akhir);
  const summary = await generateSummary(validated.id_user, validated.tanggal_awal, validated.tanggal_akhir);

  const laporan = await updateLaporan(
    validated.id_laporan,
    validated.id_user,
    validated.periode,
    validated.tanggal_awal,
    validated.tanggal_akhir,
    summary.total_pemasukan,
    summary.total_pengeluaran,
    summary.saldo,
  );

  if (!laporan) {
    throw new AppError('Laporan gagal diupdate', 500);
  }

  return laporan;
};

export const deleteLaporanService = async (id_laporan, id_user) => {
  const validated = await validateDeleteLaporan(findUserById, getLaporanById, id_laporan, id_user);
  const laporan = await deleteLaporan(validated.id_laporan, validated.id_user);

  if (!laporan) {
    throw new AppError('Laporan tidak ditemukan atau sudah dihapus', 404);
  }

  return laporan;
};
