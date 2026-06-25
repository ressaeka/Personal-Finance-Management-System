import express from "express";
import authLimiter from "../middleware/rateLimit.js"
import { authenticate } from "../middleware/auth.js";
import {register, login, profile, updateUser, logout } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/profile", authenticate, profile);
router.put("/profile", authenticate, updateUser);
router.post("/logout", authenticate, logout);

export default router;