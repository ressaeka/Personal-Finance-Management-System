import pkg from "pg";
import dotenv from "dotenv";

dotenv.config()

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  database:
    process.env.NODE_ENV === "test"
      ? process.env.DB_TEST
      : process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("DB CONNECTION OK:", result.rows[0]);
  } catch (err) {
    console.log("DB CONNECTION ERROR:", err.message);
  }
})();

export default pool;