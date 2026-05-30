import express from 'express';
import {
  generateLaporan,
  getAllLaporan,
  getLaporanByPeriode,
  rekapOtomatis,
  deleteLaporan,
} from '../controllers/laporan.js';
import { authenticate } from '../middleware/auth.js';

/**
 * Router untuk endpoint laporan keuangan
 * Semua endpoint memerlukan autentikasi token JWT
 * @type {import("express").Router}
 */
const router = express.Router();

router.post('/generate', authenticate, generateLaporan);
router.get('/', authenticate, getAllLaporan);
router.get('/:periode', authenticate, getLaporanByPeriode);
router.post('/rekap', authenticate, rekapOtomatis);
router.delete('/:id_laporan', authenticate, deleteLaporan);

export default router;
