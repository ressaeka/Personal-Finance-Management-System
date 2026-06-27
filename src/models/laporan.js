import prisma from "../config/prisma.js";

export const getDashboardStats = async (id_user) => {
  const [row] = await prisma.$queryRaw`
  SELECT
    COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0)::float8 AS total_pemasukan,
    COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN t.jumlah ELSE 0 END), 0)::float8 AS total_pengeluaran,
    COALESCE(SUM(t.jumlah), 0)::float8 AS saldo
  FROM transaksi t
  JOIN category c ON c.id_category = t.id_category
  WHERE t.id_user = ${id_user}
    AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND t.is_deleted = FALSE
  `;

  return {
    total_pemasukan: Number(row.total_pemasukan),
    total_pengeluaran: Number(row.total_pengeluaran),
    saldo: Number(row.saldo),
  };
};

export const getMonthlyReport = async (userId) => {
  return prisma.$queryRaw`
    SELECT
      TO_CHAR(DATE_TRUNC('month', t.created_at), 'YYYY-MM') as bulan,
      COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0)::float8 as pemasukan,
      COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN t.jumlah ELSE 0 END), 0)::float8 as pengeluaran,
      COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE -t.jumlah END), 0)::float8 as saldo
    FROM transaksi t
    JOIN category c ON c.id_category = t.id_category
    WHERE t.id_user = ${userId}
      AND t.is_deleted = FALSE
    GROUP BY DATE_TRUNC('month', t.created_at)
    ORDER BY bulan DESC
  `;
};

export const getCategoryReportCurrentMonth = async (userId, tipe = null) => {
  if (tipe) {
    return prisma.$queryRaw`
      SELECT
        c.nama_category,
        c.tipe,
        COALESCE(SUM(t.jumlah), 0)::float8 as total
      FROM transaksi t
      JOIN category c ON c.id_category = t.id_category
      WHERE t.id_user = ${userId}
        AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        AND t.is_deleted = FALSE
        AND c.tipe = ${tipe}
      GROUP BY c.id_category, c.nama_category, c.tipe
      ORDER BY total DESC
    `;
  }

  return prisma.$queryRaw`
    SELECT
      c.nama_category,
      c.tipe,
      COALESCE(SUM(t.jumlah), 0)::float8 as total
    FROM transaksi t
    JOIN category c ON c.id_category = t.id_category
    WHERE t.id_user = ${userId}
      AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_DATE)
      AND t.is_deleted = FALSE
    GROUP BY c.id_category, c.nama_category, c.tipe
    ORDER BY total DESC
  `;
};
