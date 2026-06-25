// routes/auth.js
import authLimiter from "../middleware/rateLimit.js"
import express from "express";
import { authenticate } from "../middleware/auth.js";
import {register, login, profile, updateUser, logout } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register, authLimiter);
router.post("/login", login, authLimiter);
router.get("/profile", authenticate, profile);
router.put("/profile", authenticate, updateUser);
router.post("/logout", logout);

export default router;