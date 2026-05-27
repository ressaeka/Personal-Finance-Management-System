import pool from "../config/database.js";

export const createUsers = async ({ username, email, password }) => {
    const query = await pool.query(
        `INSERT INTO users (username, email, password, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id_user, username, email, created_at, updated_at`,
        [username, email, password]
    );
    return query.rows[0] ?? null;
};

export const findUserByUsername = async (username) => {
    const query = await pool.query(
        `SELECT id_user, username, email, password, created_at, updated_at
         FROM users
         WHERE username = $1`,
        [username]
    );
    return query.rows[0] ?? null;
};

export const findUserByEmail = async (email) => {
    const query = await pool.query(
        `SELECT id_user, username, email, password, created_at, updated_at
         FROM users
         WHERE email = $1`,
        [email]
    );
    return query.rows[0] ?? null;
};

export const findUserById = async (id_user) => {
    const query = await pool.query(
        `SELECT id_user, username, email, password, created_at, updated_at
         FROM users
         WHERE id_user = $1`,
        [id_user]
    );
    return query.rows[0] ?? null;
};

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