import { getDashboardStatsService, getMonthlyReportService, getCategoryReportCurrentMonthService } from "../service/laporan.js";
import { successResponse, errorResponse } from "../utils/response.js";

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
