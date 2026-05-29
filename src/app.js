import express from "express";
import dotenv from "dotenv";
import auth from "./routes/auth.js";
import category from "./routes/category.js";
import transaksi from "./routes/transaksi.js";
import laporan from "./routes/laporan.js";

// Menginisialisasi koneksi database saat aplikasi pertama kali dinyalakan
import "./config/database.js"; 

// Mengimport kustom middleware yang sudah kita standardisasi
import corsMiddleware from "./middleware/cors.js";
import { errorHandle } from "./middleware/errorHandle.js";

// Memuat variabel lingkungan dari file .env
dotenv.config();

/**
 * Inisialisasi Aplikasi Express
 * @type {express.Application}
 */
const app = express();

// --- GLOBAL MIDDLEWARES ---
// Mengaktifkan konfigurasi pengaman CORS untuk domain frontend
app.use(corsMiddleware);

// Middleware built-in Express untuk membaca incoming request body berupa JSON (max 10kb)
app.use(express.json({ limit: "10kb" }));

// --- API ROUTES (V1) ---
app.use("/api/v1/auth", auth);        
app.use("/api/v1/category", category);
app.use("/api/v1/transaksi", transaksi);
app.use("/api/v1/laporan", laporan);

// --- GLOBAL ERROR HANDLER ---
// Wajib diletakkan di paling bawah setelah seluruh rute didaftarkan
app.use(errorHandle);

export default app;