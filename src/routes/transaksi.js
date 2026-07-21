import express from "express";
import { createTransaksi, findAllTransaksi, findTransaksiById, updateTransaksi, deleteTransaksi } from "../controllers/transaksi.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createTransaksiSchema, updateTransaksiSchema, transaksiIdSchema } from "../validators/transaksi.js";

const router = express.Router();

router.post( "/", authenticate, validate(createTransaksiSchema), createTransaksi );
router.get( "/", authenticate, findAllTransaksi );
router.get( "/:id", authenticate, validate(transaksiIdSchema, "params"), findTransaksiById );
router.put( "/:id", authenticate, validate(transaksiIdSchema, "params"), validate(updateTransaksiSchema), updateTransaksi );
router.delete( "/:id", authenticate, validate(transaksiIdSchema, "params"), deleteTransaksi );

export default router;