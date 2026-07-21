import express from "express";
import { createCategory, getAllCategory, getCategoryById, updateCategory, deleteCategory } from "../controllers/category.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from "../validators/category.js";

const router = express.Router();

router.post( "/", authenticate, validate(createCategorySchema), createCategory );
router.get( "/", authenticate, getAllCategory );
router.get( "/:id", authenticate, validate(categoryIdSchema, "params"), getCategoryById);
router.put( "/:id", authenticate, validate(categoryIdSchema, "params"), validate(updateCategorySchema), updateCategory);
router.delete( "/:id", authenticate, validate(categoryIdSchema, "params"), deleteCategory);

export default router;