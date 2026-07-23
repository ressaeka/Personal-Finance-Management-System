import express from "express";
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import category from "./routes/category.js";
import transaksi from "./routes/transaksi.js";
import laporan from "./routes/laporan.js";

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Mengimport kustom middleware
import helmetMiddleware from "./middleware/helmet.js";
import corsMiddleware from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --- GLOBAL MIDDLEWARES ---
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(express.json({
    limit: "10kb"
}));
// --- API ROUTES (V1) ---
app.use("/api/v1/auth", auth);
app.use("/api/v1/category", category);
app.use("/api/v1/transaksi", transaksi);
app.use("/api/v1/laporan", laporan);

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

export default app;
