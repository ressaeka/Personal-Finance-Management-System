import pool from "../config/database.js";

const hitungTransaksi = async (id_user, tanggal_awal, tanggal_akhir) => {
    const result = await pool.query(
        `SELECT
            COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) AS total_pemasukan,
            COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN t.jumlah ELSE 0 END), 0) AS total_pengeluaran,
            COALESCE(SUM(CASE WHEN c.tipe = 'pemasukan' THEN t.jumlah ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN c.tipe = 'pengeluaran' THEN t.jumlah ELSE 0 END), 0) AS saldo
         FROM transaksi t
         JOIN category c ON t.id_category = c.id_category
         WHERE t.id_user = $1 AND t.tanggal BETWEEN $2 AND $3 AND t.is_deleted = FALSE`,
        [id_user, tanggal_awal, tanggal_akhir]
    );
    return result.rows[0];
};

export const upsertLaporan = async (id_user, periode, tanggal_awal, tanggal_akhir) => {
    const { total_pemasukan, total_pengeluaran, saldo } = await hitungTransaksi(id_user, tanggal_awal, tanggal_akhir);

    const query = await pool.query(
        `INSERT INTO laporan (id_user, periode, tanggal_awal, tanggal_akhir, total_pemasukan, total_pengeluaran, saldo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (id_user, periode) DO UPDATE
         SET tanggal_awal = EXCLUDED.tanggal_awal,
             tanggal_akhir = EXCLUDED.tanggal_akhir,
             total_pemasukan = EXCLUDED.total_pemasukan,
             total_pengeluaran = EXCLUDED.total_pengeluaran,
             saldo = EXCLUDED.saldo,
             updated_at = NOW()
         RETURNING id_laporan, id_user, periode, tanggal_awal, tanggal_akhir,
                   total_pemasukan, total_pengeluaran, saldo, created_at, updated_at`,
        [id_user, periode, tanggal_awal, tanggal_akhir, total_pemasukan, total_pengeluaran, saldo]
    );
    return query.rows[0] ?? null;
};

export const getAllLaporan = async (id_user) => {
    const query = await pool.query(
        `SELECT id_laporan, id_user, periode, tanggal_awal, tanggal_akhir,
                total_pemasukan, total_pengeluaran, saldo, created_at, updated_at
         FROM laporan
         WHERE id_user = $1
         ORDER BY periode DESC`,
        [id_user]
    );
    return query.rows;
};

export const getLaporanByPeriode = async (id_user, periode) => {
    const query = await pool.query(
        `SELECT id_laporan, id_user, periode, tanggal_awal, tanggal_akhir,
                total_pemasukan, total_pengeluaran, saldo, created_at, updated_at
         FROM laporan
         WHERE id_user = $1 AND periode = $2`,
        [id_user, periode]
    );
    return query.rows[0] ?? null;
};

export const generateLaporanBulanan = async (id_user, tahun, bulan) => {
    const periode = `${tahun}-${String(bulan).padStart(2, '0')}`;
    const tanggal_awal = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    const tanggal_akhir = new Date(tahun, bulan, 0).toISOString().split('T')[0];

    return await upsertLaporan(id_user, periode, tanggal_awal, tanggal_akhir);
};

export const rekapOtomatis = async (id_user, tanggal) => {
    const laporanList = await pool.query(
        `SELECT id_laporan, periode, tanggal_awal, tanggal_akhir
         FROM laporan
         WHERE id_user = $1 AND $2 BETWEEN tanggal_awal AND tanggal_akhir`,
        [id_user, tanggal]
    );

    if (laporanList.rows.length === 0) return [];

    const updated = [];
    for (const row of laporanList.rows) {
        const { total_pemasukan, total_pengeluaran, saldo } = await hitungTransaksi(id_user, row.tanggal_awal, row.tanggal_akhir);

        const result = await pool.query(
            `UPDATE laporan
             SET total_pemasukan = $1, total_pengeluaran = $2, saldo = $3, updated_at = NOW()
             WHERE id_laporan = $4
             RETURNING id_laporan, periode, total_pemasukan, total_pengeluaran, saldo`,
            [total_pemasukan, total_pengeluaran, saldo, row.id_laporan]
        );
        updated.push(result.rows[0]);
    }
    return updated;
};

export const deleteLaporan = async (id_laporan, id_user) => {
    const query = await pool.query(
        `DELETE FROM laporan
         WHERE id_laporan = $1 AND id_user = $2
         RETURNING id_laporan`,
        [id_laporan, id_user]
    );
    return query.rows[0] ?? null;
};
