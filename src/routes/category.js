import express from "express";
import { category } from "../controllers/category.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router()

router.post("/", authenticate, category )

export default router;
