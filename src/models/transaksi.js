import pool from "../config/database.js";

export const createTransaksi = async (id_user, id_category, jumlah, deskripsi, tanggal) => {
    const query = await pool.query(
        `INSERT INTO transaksi (id_user, id_category, jumlah, deskripsi, tanggal, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, created_at, updated_at`,
        [id_user, id_category, jumlah, deskripsi, tanggal]
    );
    return query.rows[0] ?? null;
};

export const getAllTransaksi = async (id_user) => {
    const query = await pool.query(
        `SELECT t.id_transaksi, t.id_user, t.id_category, c.nama_category, c.tipe, 
                t.jumlah, t.deskripsi, t.tanggal, t.created_at, t.updated_at
         FROM transaksi t
         JOIN category c ON t.id_category = c.id_category
         WHERE t.id_user = $1 AND t.is_deleted = FALSE
         ORDER BY t.tanggal DESC, t.created_at DESC`,
        [id_user]
    );
    return query.rows;
};

export const getTransaksiById = async (id_transaksi, id_user) => {
    const query = await pool.query(
        `SELECT t.id_transaksi, t.id_user, t.id_category, c.nama_category, c.tipe, 
                t.jumlah, t.deskripsi, t.tanggal, t.created_at, t.updated_at, t.is_deleted
         FROM transaksi t
         JOIN category c ON t.id_category = c.id_category
         WHERE t.id_transaksi = $1 AND t.id_user = $2 AND t.is_deleted = FALSE`,
        [id_transaksi, id_user]
    );
    return query.rows[0] ?? null;
};

export const updateTransaksi = async (id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal) => {
    const query = await pool.query(
        `UPDATE transaksi
         SET id_category = $1, jumlah = $2, deskripsi = $3, tanggal = $4, updated_at = NOW()
         WHERE id_transaksi = $5 AND id_user = $6 AND is_deleted = FALSE
         RETURNING id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, updated_at`,
        [id_category, jumlah, deskripsi, tanggal, id_transaksi, id_user]
    );
    return query.rows[0] ?? null;
};

export const deleteTransaksi = async (id_transaksi, id_user) => {
    const query = await pool.query(
        `UPDATE transaksi
         SET is_deleted = TRUE, deleted_at = NOW()
         WHERE id_transaksi = $1 AND id_user = $2 AND is_deleted = FALSE
         RETURNING id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, deleted_at`,
        [id_transaksi, id_user]
    );
    return query.rows[0] ?? null;
};