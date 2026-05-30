import pool from '../config/database.js';

export const createTransaksi = async (id_user, id_category, jumlah, deskripsi, tanggal, catatan = null) => {
  const query = await pool.query(
    `INSERT INTO transaksi (id_user, id_category, jumlah, deskripsi, tanggal, catatan, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, catatan, created_at, updated_at`,
    [id_user, id_category, jumlah, deskripsi, tanggal, catatan],
  );
  return query.rows[0] ?? null;
};

export const getAllTransaksi = async (id_user, limit = null) => {
  let queryStr = `
    SELECT t.id_transaksi, t.id_user, t.id_category, c.nama_category, c.tipe, c.warna, c.icon,
            t.jumlah, t.deskripsi, t.catatan, t.tanggal, t.created_at, t.updated_at
     FROM transaksi t
     LEFT JOIN category c ON t.id_category = c.id_category
     WHERE t.id_user = $1 AND t.is_deleted = FALSE
     ORDER BY t.tanggal DESC, t.created_at DESC`;
  const params = [id_user];

  if (limit && Number(limit) > 0) {
    queryStr += ` LIMIT $2`;
    params.push(Number(limit));
  }

  const query = await pool.query(queryStr, params);
  return query.rows;
};

export const getTransaksiById = async (id_transaksi, id_user) => {
  const query = await pool.query(
    `SELECT t.id_transaksi, t.id_user, t.id_category, c.nama_category, c.tipe, c.warna, c.icon,
            t.jumlah, t.deskripsi, t.catatan, t.tanggal, t.created_at, t.updated_at, t.is_deleted
     FROM transaksi t
     LEFT JOIN category c ON t.id_category = c.id_category
     WHERE t.id_transaksi = $1 AND t.id_user = $2 AND t.is_deleted = FALSE`,
    [id_transaksi, id_user],
  );
  return query.rows[0] ?? null;
};

export const updateTransaksi = async (id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, catatan = null) => {
  const query = await pool.query(
    `UPDATE transaksi
     SET id_category = $1, jumlah = $2, deskripsi = $3, tanggal = $4, catatan = $5, updated_at = NOW()
     WHERE id_transaksi = $6 AND id_user = $7 AND is_deleted = FALSE
     RETURNING id_transaksi, id_user, id_category, jumlah, deskripsi, catatan, tanggal, updated_at`,
    [id_category, jumlah, deskripsi, tanggal, catatan, id_transaksi, id_user],
  );
  return query.rows[0] ?? null;
};

export const deleteTransaksi = async (id_transaksi, id_user) => {
  const query = await pool.query(
    `UPDATE transaksi SET is_deleted = TRUE, deleted_at = NOW()
     WHERE id_transaksi = $1 AND id_user = $2 AND is_deleted = FALSE
     RETURNING id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal, deleted_at`,
    [id_transaksi, id_user],
  );
  return query.rows[0] ?? null;
};

export const getDailyStats = async (id_user, tahun, bulan) => {
  let queryStr;
  const params = [id_user];

  if (tahun && bulan) {
    queryStr = `
      SELECT t.tanggal,
              COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS pemasukan,
              COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS pengeluaran
       FROM transaksi t
       JOIN category c ON t.id_category = c.id_category
       WHERE t.id_user = $1 AND t.is_deleted = FALSE
         AND EXTRACT(YEAR FROM t.tanggal) = $2
         AND EXTRACT(MONTH FROM t.tanggal) = $3
       GROUP BY t.tanggal
       ORDER BY t.tanggal`;
    params.push(tahun, bulan);
  } else {
    queryStr = `
      SELECT t.tanggal,
              COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS pemasukan,
              COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS pengeluaran
       FROM transaksi t
       JOIN category c ON t.id_category = c.id_category
       WHERE t.id_user = $1 AND t.is_deleted = FALSE
         AND t.tanggal >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY t.tanggal
       ORDER BY t.tanggal`;
  }

  const query = await pool.query(queryStr, params);
  return query.rows;
};

export const getMonthlyStats = async (id_user, tahun = null, bulan = null) => {
  let queryStr;
  const params = [id_user];

  if (tahun && bulan) {
    queryStr = `
      SELECT TO_CHAR(t.tanggal, 'YYYY-MM') AS bulan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS pemasukan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS pengeluaran
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
        AND EXTRACT(YEAR FROM t.tanggal) = $2
        AND EXTRACT(MONTH FROM t.tanggal) = $3
      GROUP BY TO_CHAR(t.tanggal, 'YYYY-MM')
      ORDER BY bulan`;
    params.push(tahun, bulan);
  } else if (tahun) {
    queryStr = `
      SELECT TO_CHAR(t.tanggal, 'YYYY-MM') AS bulan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS pemasukan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS pengeluaran
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
        AND EXTRACT(YEAR FROM t.tanggal) = $2
      GROUP BY TO_CHAR(t.tanggal, 'YYYY-MM')
      ORDER BY bulan`;
    params.push(tahun);
  } else {
    queryStr = `
      SELECT TO_CHAR(t.tanggal, 'YYYY-MM') AS bulan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS pemasukan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS pengeluaran
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
        AND t.tanggal >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(t.tanggal, 'YYYY-MM')
      ORDER BY bulan`;
  }

  const query = await pool.query(queryStr, params);
  return query.rows;
};

export const getCategoryStats = async (id_user, tahun = null, bulan = null) => {
  let queryStr;
  const params = [id_user];

  if (tahun && bulan) {
    queryStr = `
      SELECT c.id_category, c.nama_category, c.tipe, c.warna, c.icon, c.budget,
             COALESCE(SUM(ABS(t.jumlah)), 0) AS total
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
        AND EXTRACT(YEAR FROM t.tanggal) = $2
        AND EXTRACT(MONTH FROM t.tanggal) = $3
      GROUP BY c.id_category, c.nama_category, c.tipe, c.warna, c.icon, c.budget
      ORDER BY total DESC`;
    params.push(tahun, bulan);
  } else if (tahun) {
    queryStr = `
      SELECT c.id_category, c.nama_category, c.tipe, c.warna, c.icon, c.budget,
             COALESCE(SUM(ABS(t.jumlah)), 0) AS total
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
        AND EXTRACT(YEAR FROM t.tanggal) = $2
      GROUP BY c.id_category, c.nama_category, c.tipe, c.warna, c.icon, c.budget
      ORDER BY total DESC`;
    params.push(tahun);
  } else {
    queryStr = `
      SELECT c.id_category, c.nama_category, c.tipe, c.warna, c.icon, c.budget,
             COALESCE(SUM(ABS(t.jumlah)), 0) AS total
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
      GROUP BY c.id_category, c.nama_category, c.tipe, c.warna, c.icon, c.budget
      ORDER BY total DESC`;
  }

  const query = await pool.query(queryStr, params);
  return query.rows;
};

export const getSummary = async (id_user, tahun = null, bulan = null) => {
  let queryStr;
  const params = [id_user];

  if (tahun && bulan) {
    queryStr = `
      SELECT COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS total_pemasukan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS total_pengeluaran
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
        AND EXTRACT(YEAR FROM t.tanggal) = $2
        AND EXTRACT(MONTH FROM t.tanggal) = $3`;
    params.push(tahun, bulan);
  } else if (tahun) {
    queryStr = `
      SELECT COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS total_pemasukan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS total_pengeluaran
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE
        AND EXTRACT(YEAR FROM t.tanggal) = $2`;
    params.push(tahun);
  } else {
    queryStr = `
      SELECT COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS total_pemasukan,
             COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN ABS(t.jumlah) ELSE 0 END), 0) AS total_pengeluaran
      FROM transaksi t
      JOIN category c ON t.id_category = c.id_category
      WHERE t.id_user = $1 AND t.is_deleted = FALSE`;
  }

  const query = await pool.query(queryStr, params);
  return query.rows[0] ?? { total_pemasukan: 0, total_pengeluaran: 0 };
};
