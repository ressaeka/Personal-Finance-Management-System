import pool from "../config/database.js";

/**
 * Membuat transaksi baru
 * @param {number} id_user - ID pemilik transaksi
 * @param {number} id_category - ID kategori transaksi
 * @param {number} jumlah - Jumlah nominal transaksi
 * @param {string} deskripsi - Deskripsi transaksi
 * @param {string} tanggal - Tanggal transaksi (YYYY-MM-DD)
 * @returns {Promise<Object|null>} Data transaksi baru, atau null
 */
export const createTransaksi = async (id_user, id_category, jumlah, deskripsi, tanggal) => {
    const query = await pool.query(
        `INSERT INTO transaksi (id_user, id_category, jumlah, deskripsi, tanggal, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, created_at, updated_at`,
        [id_user, id_category, jumlah, deskripsi, tanggal]
    );
    return query.rows[0] ?? null;
};

/**
 * Mengambil semua transaksi milik user (soft-deleted tidak termasuk)
 * Dilakukan JOIN dengan tabel category untuk menampilkan nama_category dan tipe
 * @param {number} id_user - ID user
 * @returns {Promise<Array>} Array transaksi
 */
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

/**
 * Mengambil satu transaksi berdasarkan id dan pemilik
 * @param {number} id_transaksi - ID transaksi
 * @param {number} id_user - ID pemilik
 * @returns {Promise<Object|null>} Data transaksi atau null
 */
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

/**
 * Memperbarui data transaksi
 * @param {number} id_transaksi - ID transaksi
 * @param {number} id_user - ID pemilik
 * @param {number} id_category - ID kategori baru
 * @param {number} jumlah - Jumlah nominal baru
 * @param {string} deskripsi - Deskripsi baru
 * @param {string} tanggal - Tanggal baru (YYYY-MM-DD)
 * @returns {Promise<Object|null>} Data transaksi yang diupdate, atau null
 */
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

/**
 * Soft-delete transaksi (set is_deleted = TRUE)
 * @param {number} id_transaksi - ID transaksi
 * @param {number} id_user - ID pemilik
 * @returns {Promise<Object|null>} Data transaksi yang dihapus (deleted_at), atau null
 */
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