import pool from '../config/database.js';

export const createCategory = async (id_user, nama_category, tipe, budget = null, warna = '#6366f1', icon = 'FolderOpen') => {
  const query = await pool.query(
    `INSERT INTO category (id_user, nama_category, tipe, budget, warna, icon, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id_category, id_user, nama_category, tipe, budget, warna, icon, created_at, updated_at`,
    [id_user, nama_category, tipe, budget, warna, icon],
  );
  return query.rows[0] ?? null;
};

export const getAllCategory = async (id_user) => {
  const query = await pool.query(
    `SELECT id_category, id_user, nama_category, tipe, budget, warna, icon, created_at, updated_at
     FROM category
     WHERE id_user = $1 AND is_deleted = FALSE
     ORDER BY id_category ASC`,
    [id_user],
  );
  return query.rows;
};

export const getCategoryById = async (id_category, id_user) => {
  const query = await pool.query(
    `SELECT id_category, id_user, nama_category, tipe, budget, warna, icon, is_deleted, created_at, updated_at, deleted_at
     FROM category
     WHERE id_category = $1 AND id_user = $2 AND is_deleted = FALSE`,
    [id_category, id_user],
  );
  return query.rows[0] ?? null;
};

export const updateCategory = async (id_category, id_user, nama_category, tipe, budget = null, warna = '#6366f1', icon = 'FolderOpen') => {
  const query = await pool.query(
    `UPDATE category
     SET nama_category = $1, tipe = $2, budget = $3, warna = $4, icon = $5, updated_at = NOW()
     WHERE id_category = $6 AND id_user = $7 AND is_deleted = FALSE
     RETURNING id_category, id_user, nama_category, tipe, budget, warna, icon, updated_at`,
    [nama_category, tipe, budget, warna, icon, id_category, id_user],
  );
  return query.rows[0] ?? null;
};

export const deleteCategory = async (id_category, id_user) => {
  const query = await pool.query(
    `UPDATE category SET is_deleted = TRUE, deleted_at = NOW()
     WHERE id_category = $1 AND id_user = $2 AND is_deleted = FALSE
     RETURNING id_category, nama_category, tipe, deleted_at`,
    [id_category, id_user],
  );
  return query.rows[0] ?? null;
};
