import express from "express";

import { authLimiter } from "../middleware/rateLimit.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

import { registerSchema, loginSchema, refreshTokenSchema, updateSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.js";

import { register, login, refresh, profile, updateProfile, forgotPassword,resetPassword, logout } from "../controllers/auth.js";

const router = express.Router();

router.post( "/register", authLimiter, validate(registerSchema), register );
router.post( "/login", authLimiter, validate(loginSchema), login );
router.post( "/refresh", authLimiter, validate(refreshTokenSchema), refresh );
router.post("/forgot-password", validate(forgotPasswordSchema),forgotPassword);
router.post( "/reset-password", validate(resetPasswordSchema), resetPassword);
router.get( "/profile", authenticate, profile );
router.put( "/profile", authenticate, validate(updateSchema), updateProfile );
router.post( "/logout", authenticate, logout );

export default router;