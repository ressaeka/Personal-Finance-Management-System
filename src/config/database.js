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

export default pool;