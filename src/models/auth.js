import pool from "../config/database.js";

/**
 * Membuat user baru di tabel users
 * @param {Object} param0 - Object berisi username, email, password
 * @param {string} param0.username - Username user baru
 * @param {string} param0.email - Email user baru
 * @param {string} param0.password - Password yang sudah di-hash
 * @returns {Promise<Object|null>} Data user baru tanpa password, atau null jika gagal
 */
export const createUsers = async ({ username, email, password }) => {
    const query = await pool.query(
        `INSERT INTO users (username, email, password, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id_user, username, email, created_at, updated_at`,
        [username, email, password]
    );
    return query.rows[0] ?? null;
};

/**
 * Mencari user berdasarkan username
 * @param {string} username - Username yang ingin dicari
 * @returns {Promise<Object|null>} Data user (termasuk password) atau null
 */
export const findUserByUsername = async (username) => {
    const query = await pool.query(
        `SELECT id_user, username, email, password, created_at, updated_at
         FROM users
         WHERE username = $1`,
        [username]
    );
    return query.rows[0] ?? null;
};

/**
 * Mencari user berdasarkan email
 * @param {string} email - Email yang ingin dicari
 * @returns {Promise<Object|null>} Data user (termasuk password) atau null
 */
export const findUserByEmail = async (email) => {
    const query = await pool.query(
        `SELECT id_user, username, email, password, created_at, updated_at
         FROM users
         WHERE email = $1`,
        [email]
    );
    return query.rows[0] ?? null;
};

/**
 * Mencari user berdasarkan id_user
 * @param {number} id_user - ID user yang ingin dicari
 * @returns {Promise<Object|null>} Data user (termasuk password) atau null
 */
export const findUserById = async (id_user) => {
    const query = await pool.query(
        `SELECT id_user, username, email, password, created_at, updated_at
         FROM users
         WHERE id_user = $1`,
        [id_user]
    );
    return query.rows[0] ?? null;
};

/**
 * Memperbarui data user berdasarkan id_user
 * @param {number} id_user - ID user yang akan diupdate
 * @param {string} username - Username baru
 * @param {string} email - Email baru
 * @param {string} password - Password baru yang sudah di-hash
 * @returns {Promise<Object|null>} Data user yang telah diupdate (tanpa password), atau null
 */
export const updateUserById = async (id_user, username, email, password) => {
    const query = await pool.query(
        `UPDATE users
         SET username = $1, email = $2, password = $3, updated_at = NOW()
         WHERE id_user = $4
         RETURNING id_user, username, email, updated_at`,
        [username, email, password, id_user]
    );
    return query.rows[0] ?? null;
};