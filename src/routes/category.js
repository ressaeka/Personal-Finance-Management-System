import express from "express";
import { category, getAllCategory } from "../controllers/category.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router()

router.post("/", authenticate, category )
router.get("/",authenticate, getAllCategory)

export default router;
