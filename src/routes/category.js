import express from "express";
import { createCategory, getAllCategory, getCategoryById, updateCategory, deleteCategory  } from "../controllers/category.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router()

router.post("/", authenticate, createCategory)
router.get("/",authenticate, getAllCategory)
router.get("/:id_category", authenticate, getCategoryById)
router.put("/:id_category", authenticate, updateCategory  )
router.delete("/:id_category", authenticate, deleteCategory)

export default router;
