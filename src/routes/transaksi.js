import express from "express";
import { createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi } from "../controllers/transaksi.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createTransaksiSchema, updateTransaksiSchema, transaksiIdSchema } from "../validators/transaksi.js";

const router = express.Router();

router.post( "/", authenticate, validate(createTransaksiSchema), createTransaksi );
router.get( "/", authenticate, getAllTransaksi );
router.get( "/:id_transaksi", authenticate, validate(transaksiIdSchema, "params"), getTransaksiById );
router.put( "/:id_transaksi", authenticate, validate(transaksiIdSchema, "params"), validate(updateTransaksiSchema), updateTransaksi );
router.delete( "/:id_transaksi", authenticate, validate(transaksiIdSchema, "params"), deleteTransaksi );

export default router;