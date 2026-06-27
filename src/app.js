import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import auth from "./routes/auth.js";
import category from "./routes/category.js";
import transaksi from "./routes/transaksi.js";
import laporan from "./routes/laporan.js";

dotenv.config();

import corsMiddleware from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --- SECURITY MIDDLEWARES ---
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "10kb" }));

// --- HEALTH CHECK ---
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- API ROUTES (V1) ---
app.use("/api/v1/auth", auth);
app.use("/api/v1/category", category);
app.use("/api/v1/transaksi", transaksi);
app.use("/api/v1/laporan", laporan);

// --- 404 HANDLER ---
app.use((req, res) => {
  res.status(404).json({ status: "failed", message: "Route not found" });
});

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

export default app;
