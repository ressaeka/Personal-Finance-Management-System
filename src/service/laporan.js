import { getDashboardStats, getMonthlyReport, getCategoryReportCurrentMonth } from "../models/laporan.js";
import {
  validateDashboardStats,
  validateMonthlyReport,
  validateCategoryReport,
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
