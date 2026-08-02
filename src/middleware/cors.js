import cors from "cors";
import { AppError } from "../utils/appError.js";

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);           
    } else {
      callback(new AppError("Origin tidak diizinkan", 403));
    }
  },
  credentials: true,
});

export default corsMiddleware;