import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

/**
 * Konfigurasi Pool Koneksi PostgreSQL
 * Mengatur parameter koneksi berdasarkan environment variables dari file .env
 * @type {Pool}
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database:
    process.env.NODE_ENV === "test"
      ? process.env.DB_TEST
      : process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Menangani error pada pool koneksi secara global agar process tidak crash
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err.message);
});

export default pool;