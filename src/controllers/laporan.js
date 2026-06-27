import {
  getDashboardStatsService,
  getMonthlyReportService,
  getCategoryReportCurrentMonthService,
  createLaporanService,
  getAllLaporanService,
  getLaporanByIdService,
  updateLaporanService,
  deleteLaporanService,
} from "../service/laporan.js";
import { successResponse } from "../utils/response.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const id_user = req.user.id_user;
    const result = await getDashboardStatsService(id_user);
    return successResponse(res, result, "Berhasil mengambil data dashboard");
  } catch (err) {
    return next(err);
  }
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    const id_user = req.user.id_user;
    const result = await getMonthlyReportService(id_user);
    return successResponse(res, result, "Berhasil mengambil laporan bulanan");
  } catch (err) {
    return next(err);
  }
};

export const getCategoryReportCurrentMonth = async (req, res, next) => {
  try {
    const id_user = req.user.id_user;
    const { tipe } = req.query;
    const result = await getCategoryReportCurrentMonthService(id_user, tipe || null);
    return successResponse(res, result, "Berhasil mengambil laporan per kategori");
  } catch (err) {
    return next(err);
  }
};

export const createLaporan = async (req, res, next) => {
  try {
    const { periode, tanggal_awal, tanggal_akhir } = req.body;
    const id_user = req.user.id_user;
    const result = await createLaporanService(id_user, periode, tanggal_awal, tanggal_akhir);
    return successResponse(res, result, "Laporan berhasil dibuat", 201);
  } catch (err) {
    return next(err);
  }
};

export const getAllLaporan = async (req, res, next) => {
  try {
    const id_user = req.user.id_user;
    const result = await getAllLaporanService(id_user);
    return successResponse(res, { laporan: result }, "Berhasil mengambil semua laporan");
  } catch (err) {
    return next(err);
  }
};

export const getLaporanById = async (req, res, next) => {
  try {
    const { id_laporan } = req.params;
    const id_user = req.user.id_user;
    const result = await getLaporanByIdService(id_laporan, id_user);
    return successResponse(res, result, "Berhasil mengambil laporan");
  } catch (err) {
    return next(err);
  }
};

export const updateLaporan = async (req, res, next) => {
  try {
    const { id_laporan } = req.params;
    const id_user = req.user.id_user;
    const { periode, tanggal_awal, tanggal_akhir } = req.body;
    const result = await updateLaporanService(id_laporan, id_user, periode, tanggal_awal, tanggal_akhir);
    return successResponse(res, result, "Laporan berhasil diupdate");
  } catch (err) {
    return next(err);
  }
};

export const deleteLaporan = async (req, res, next) => {
  try {
    const { id_laporan } = req.params;
    const id_user = req.user.id_user;
    const result = await deleteLaporanService(id_laporan, id_user);
    return successResponse(res, result, "Laporan berhasil dihapus");
  } catch (err) {
    return next(err);
  }
};
