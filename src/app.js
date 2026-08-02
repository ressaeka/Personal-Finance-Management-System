import express from "express";
import auth from "./routes/auth.js";
import category from "./routes/category.js";
import transaksi from "./routes/transaksi.js";
import laporan from "./routes/laporan.js";
import health from "./routes/health.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import basicAuth from "express-basic-auth";
import logger from "./config/logger.js";
import httpLogger from "./middleware/logger.js";

import dotenv from "dotenv";

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Mengimport kustom middleware
import helmetMiddleware from "./middleware/helmet.js";
import corsMiddleware from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import { AppError } from "./utils/appError.js";

const app = express();

app.use(httpLogger);
logger.info("Server starting...");

app.set("trust proxy", 1);


// --- GLOBAL MIDDLEWARES ---
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(globalLimiter);
app.use(express.json({
    limit: "10kb"
}));


// --- HEALTH CHECK ---
app.use("/health", health);

// --- API ROUTES (V1) ---
app.use("/api/v1/auth", auth);
app.use("/api/v1/category", category);
app.use("/api/v1/transaksi", transaksi);
app.use("/api/v1/laporan", laporan);
const enableSwagger = process.env.ENABLE_SWAGGER === "true";
if (enableSwagger) {
  app.use(
    "/api-docs",
    basicAuth({
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
      challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
}

// --- 404 CATCH-ALL ---
app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} tidak ditemukan`, 404));
});

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

export default app;

