import express from 'express';
import {
  createTransaksi,
  getAllTransaksi,
  getTransaksiById,
  updateTransaksi,
  deleteTransaksi,
  getStats,
} from '../controllers/transaksi.js';
import { authenticate } from '../middleware/auth.js';

/**
 * Router untuk endpoint transaksi keuangan
 * Semua endpoint memerlukan autentikasi token JWT
 * @type {import("express").Router}
 */
const router = express.Router();

router.post('/', authenticate, createTransaksi);
router.get('/', authenticate, getAllTransaksi);
router.get('/stats', authenticate, getStats);
router.get('/:id_transaksi', authenticate, getTransaksiById);
router.put('/:id_transaksi', authenticate, updateTransaksi);
router.delete('/:id_transaksi', authenticate, deleteTransaksi);

export default router;
