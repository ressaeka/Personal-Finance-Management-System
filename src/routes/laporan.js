import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getLaporan } from "../controllers/laporan.js";
import { validate } from "../middleware/validate.js";
import { laporanQuerySchema } from "../validators/laporan.js"

const router = express.Router();

router.get("/", authenticate,validate(laporanQuerySchema), getLaporan);

export default router;