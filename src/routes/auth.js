import express from "express";

import authLimiter from "../middleware/rateLimit.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

import { registerSchema, loginSchema, updateSchema } from "../validators/auth.js";

import { register, login, profile, updateProfile, logout } from "../controllers/auth.js";

const router = express.Router();

router.post( "/register", authLimiter, validate(registerSchema), register );
router.post( "/login", authLimiter, validate(loginSchema), login );
router.get( "/profile", authenticate, profile );
router.put( "/profile", authenticate, validate(updateSchema), updateProfile );
router.post( "/logout", authenticate, logout );

export default router;