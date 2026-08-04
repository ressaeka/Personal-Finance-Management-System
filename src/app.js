import "dotenv/config";

import express from "express";
import swaggerUi from "swagger-ui-express";
import basicAuth from "express-basic-auth";

import swaggerSpec from "./config/swagger.js";
import logger from "./config/logger.js";

import auth from "./routes/auth.js";
import category from "./routes/category.js";
import transaksi from "./routes/transaksi.js";
import laporan from "./routes/laporan.js";
import health from "./routes/health.js";

import httpLogger from "./middleware/logger.js";
import helmetMiddleware from "./middleware/helmet.js";
import corsMiddleware from "./middleware/cors.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { AppError } from "./utils/appError.js";

const app = express();

app.set("trust proxy", 1);

/* ----------------------------- Logging ----------------------------- */

app.use(httpLogger);

/* ----------------------------- Security ---------------------------- */

app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(globalLimiter);

/* --------------------------- Body Parser --------------------------- */

app.use(
  express.json({
    limit: "10kb",
  }),
);

/* --------------------------- Health Check -------------------------- */

app.use("/health", health);

/* ----------------------------- API V1 ------------------------------ */

app.use("/api/v1/auth", auth);
app.use("/api/v1/category", category);
app.use("/api/v1/transaksi", transaksi);
app.use("/api/v1/laporan", laporan);

/* ----------------------------- Swagger ----------------------------- */

if (process.env.ENABLE_SWAGGER === "true") {
  logger.info("Swagger documentation enabled");

  app.use(
    "/api-docs",
    basicAuth({
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
      },
      challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
  );
}

/* ------------------------------ 404 ------------------------------ */

app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} tidak ditemukan`, 404));
});

/* ------------------------- Global Error --------------------------- */

app.use(errorHandler);

export default app;
