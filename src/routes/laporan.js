import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getLaporan } from "../controllers/laporan.js";

const router = express.Router();

router.get("/", authenticate, getLaporan);

export default router;