import cors from "cors";
import { AppError } from "../utils/appError.js";
import logger from "../config/logger.js";

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn({ origin }, "Blocked by CORS");

    return callback(new AppError("Origin tidak diizinkan", 403));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsMiddleware;
