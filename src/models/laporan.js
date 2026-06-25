import pool from "../config/database.js";

export const getDashboardStats = async (id_user) => {
  const query = await pool.query(
    `SELECT 
            COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) as total_pemasukan,
            COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN t.jumlah ELSE 0 END), 0) as total_pengeluaran,
            COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE -t.jumlah END), 0) as saldo
        FROM transaksi t
        JOIN category c on c.id_category = t.id_category
        WHERE t.id_user = $1
            AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_DATE)
            AND t.is_deleted = FALSE`,
    [id_user],
  );

  return {
    total_pemasukan: parseFloat(query.rows[0].total_pemasukan),
    total_pengeluaran: parseFloat(query.rows[0].total_pengeluaran),
    saldo: parseFloat(query.rows[0].saldo),
  };
};

export const getMonthlyReport = async (userId) => {
  const query = await pool.query(
    `SELECT 
            TO_CHAR(DATE_TRUNC('month', t.created_at), 'YYYY-MM') as bulan,
            COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) as pemasukan,
            COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN t.jumlah ELSE 0 END), 0) as pengeluaran,
            COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE -t.jumlah END), 0) as saldo
        FROM transaksi t
        JOIN category c ON c.id_category = t.id_category
        WHERE t.id_user = $1 
            AND t.is_deleted = FALSE
        GROUP BY DATE_TRUNC('month', t.created_at)
        ORDER BY bulan DESC`,
    [userId],
  );

  return query.rows;
};

export const getCategoryReportCurrentMonth = async (userId, tipe = null) => {
  let query = `
    SELECT 
            c.nama_category,
            c.tipe,
            COALESCE(SUM(t.jumlah), 0) as total
        FROM transaksi t
        JOIN category c ON c.id_category = t.id_category
        WHERE t.id_user = $1
            AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_DATE)
            AND t.is_deleted = FALSE
  `;
  const values = [userId];

  if (tipe) {
    query += ` AND c.tipe = $2`;
    values.push(tipe);
  }

  query += ` GROUP BY c.id_category, c.nama_category, c.tipe ORDER BY total DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};
