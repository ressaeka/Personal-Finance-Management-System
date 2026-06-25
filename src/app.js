import express from "express";
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import category from "./routes/category.js";
import transaksi from "./routes/transaksi.js";
import laporan from "./routes/laporan.js";

// Menginisialisasi koneksi database saat aplikasi pertama kali dinyalakan
import "./config/database.js";

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Mengimport kustom middleware
import corsMiddleware from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --- GLOBAL MIDDLEWARES ---
app.use(corsMiddleware);
app.use(express.json());

// --- API ROUTES (V1) ---
app.use("/api/v1/auth", auth);
app.use("/api/v1/category", category);
app.use("/api/v1/transaksi", transaksi);
app.use("/api/v1/laporan", laporan);

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

export default app;
