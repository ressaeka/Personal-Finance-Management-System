import pool from "../config/database.js";

export const createCategory = async (id_user, nama_category, tipe) => {
    const query = await pool.query(
        `INSERT INTO category (id_user, nama_category, tipe)
         VALUES ($1, $2, $3)
         RETURNING id_category, id_user, nama_category, tipe`,
        [id_user, nama_category, tipe]
    );
    return query.rows[0] ?? null;
};