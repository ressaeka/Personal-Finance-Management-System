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

export const getAllCategory = async (id_user) => {
    const query = await pool.query(
        `SELECT id_category, id_user, nama_category, tipe
        FROM category
        WHERE id_user = $1 AND is_deleted = FALSE
        ORDER BY id_category ASC`, 
        [id_user]
    )
    return query.rows;
}


export const getCategoryById  = async (id_category, id_user) => {
    const query = await pool.query(
        `SELECT id_category, id_user, nama_category, tipe
        FROM category
        WHERE id_category = $1 AND id_user = $2 AND is_deleted = FALSE`,
        [id_category, id_user]
    )

    return query.rows[0] ?? null
}