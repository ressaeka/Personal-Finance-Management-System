import express from "express";
import {
  getDashboardStats,
  getMonthlyReport,
  getCategoryReportCurrentMonth,
  createLaporan,
  getAllLaporan,
  getLaporanById,
  updateLaporan,
  deleteLaporan,
} from "../controllers/laporan.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", authenticate, getDashboardStats);
router.get("/reports/monthly", authenticate, getMonthlyReport);
router.get("/reports/category-current-month", authenticate, getCategoryReportCurrentMonth);

router.post("/", authenticate, createLaporan);
router.get("/", authenticate, getAllLaporan);
router.get("/:id_laporan", authenticate, getLaporanById);
router.put("/:id_laporan", authenticate, updateLaporan);
router.delete("/:id_laporan", authenticate, deleteLaporan);

export default router;
