import cors from "cors";

/**
 * Daftar domain (origins) yang diizinkan untuk mengakses API backend ini
 * @type {Array<string>}
 */
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173"
];

/**
 * Konfigurasi opsi untuk middleware CORS
 * Library cors hanya membaca pesan dari Error object biasa, bukan custom AppError.
 * @type {Object}
 */
const corsOptions = {
    /**
     * Fungsi dinamis untuk memvalidasi origin dari request client
     * @param {string|undefined} origin - Domain asal pengirim request
     * @param {Function} callback - Callback bawaan cors (error, allowed)
     */
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

export default cors(corsOptions);