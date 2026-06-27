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

export const generateSummary = async (id_user, tanggal_awal, tanggal_akhir) => {
  const [row] = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0)::float8 AS total_pemasukan,
      COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN t.jumlah ELSE 0 END), 0)::float8 AS total_pengeluaran,
      COALESCE(SUM(t.jumlah), 0)::float8 AS saldo
    FROM transaksi t
    JOIN category c ON c.id_category = t.id_category
    WHERE t.id_user = ${id_user}
      AND t.tanggal >= ${tanggal_awal}::date
      AND t.tanggal <= ${tanggal_akhir}::date
      AND t.is_deleted = FALSE
  `;

  return {
    total_pemasukan: Number(row.total_pemasukan),
    total_pengeluaran: Number(row.total_pengeluaran),
    saldo: Number(row.saldo),
  };
};

export const createLaporan = async (id_user, periode, tanggal_awal, tanggal_akhir, total_pemasukan, total_pengeluaran, saldo) => {
  return prisma.laporan.create({
    data: {
      id_user,
      periode,
      tanggal_awal,
      tanggal_akhir,
      total_pemasukan,
      total_pengeluaran,
      saldo,
    },
  });
};

export const getAllLaporan = async (id_user) => {
  return prisma.laporan.findMany({
    where: { id_user, is_deleted: false },
    orderBy: { created_at: "desc" },
  });
};

export const getLaporanById = async (id_laporan, id_user) => {
  return prisma.laporan.findFirst({
    where: { id_laporan, id_user, is_deleted: false },
  });
};

export const updateLaporan = async (id_laporan, id_user, periode, tanggal_awal, tanggal_akhir, total_pemasukan, total_pengeluaran, saldo) => {
  const existing = await prisma.laporan.findFirst({
    where: { id_laporan, id_user, is_deleted: false },
  });
  if (!existing) return null;

  return prisma.laporan.update({
    where: { id_laporan },
    data: {
      periode,
      tanggal_awal,
      tanggal_akhir,
      total_pemasukan,
      total_pengeluaran,
      saldo,
      updated_at: new Date(),
    },
  });
};

export const deleteLaporan = async (id_laporan, id_user) => {
  const existing = await prisma.laporan.findFirst({
    where: { id_laporan, id_user, is_deleted: false },
  });
  if (!existing) return null;

  return prisma.laporan.update({
    where: { id_laporan },
    data: { is_deleted: true, deleted_at: new Date() },
  });
};
