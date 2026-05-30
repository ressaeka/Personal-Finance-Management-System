import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/config/database.js';

let token;

const cleanDatabase = async () => {
  await pool.query('DELETE FROM laporan');
  await pool.query('DELETE FROM transaksi');
  await pool.query('DELETE FROM category');
  await pool.query('DELETE FROM users');
};

const registerAndLogin = async () => {
  const userData = {
    username: 'lap_testuser',
    email: 'lap_test@example.com',
    password: 'Test123!xyz',
  };
  await request(app).post('/api/v1/auth/register').send(userData);
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ username: 'lap_testuser', password: 'Test123!xyz' });
  token = loginRes.body.data.token;
};

const createCategory = async (nama, tipe) => {
  const res = await request(app)
    .post('/api/v1/category')
    .set('Authorization', `Bearer ${token}`)
    .send({ nama_category: nama, tipe });
  return res.body.data.id_category;
};

const createTransaksi = async (id_cat, jumlah, tanggal) => {
  await request(app)
    .post('/api/v1/transaksi')
    .set('Authorization', `Bearer ${token}`)
    .send({ id_category: id_cat, jumlah, deskripsi: 'Test', tanggal });
};

describe('Laporan API Integration (Real Database)', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await pool.query(`
            CREATE TABLE IF NOT EXISTS laporan (
                id_laporan SERIAL PRIMARY KEY,
                id_user INTEGER NOT NULL REFERENCES users(id_user),
                periode VARCHAR(7) NOT NULL,
                tanggal_awal DATE,
                tanggal_akhir DATE,
                total_pemasukan NUMERIC(12,2) DEFAULT 0,
                total_pengeluaran NUMERIC(12,2) DEFAULT 0,
                saldo NUMERIC(12,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                UNIQUE(id_user, periode)
            )
        `);
  });

  beforeEach(async () => {
    await cleanDatabase();
    await registerAndLogin();
    const catPemasukan = await createCategory('Gaji', 'pemasukan');
    const catPengeluaran = await createCategory('Makanan', 'pengeluaran');
    // pakai category pengeluaran untuk test
    // buat transaksi agar laporan punya data
    await createTransaksi(catPemasukan, 100000, '2024-06-10');
    await createTransaksi(catPengeluaran, 50000, '2024-06-15');
  });

  afterAll(async () => {
    await cleanDatabase();
    await pool.end();
  });

  describe('POST /api/v1/laporan/generate', () => {
    test('should generate laporan successfully', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ tahun: 2024, bulan: 6 });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Laporan berhasil dibuat');
      expect(res.body.data).toHaveProperty('id_laporan');
      expect(res.body.data.periode).toBe('2024-06');
    });

    test('should return 400 if tahun is missing', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ bulan: 6 });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('failed');
    });

    test('should return 400 if bulan is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ tahun: 2024, bulan: 13 });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('failed');
    });

    test('should return 401 without token', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/generate')
        .send({ tahun: 2024, bulan: 6 });

      expect(res.status).toBe(401);
    });

    test('should return 401 with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', 'Bearer invalid_token')
        .send({ tahun: 2024, bulan: 6 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/laporan', () => {
    test('should return all laporan for authenticated user', async () => {
      await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ tahun: 2024, bulan: 6 });

      const res = await request(app)
        .get('/api/v1/laporan')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Berhasil mengambil semua laporan');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test('should return empty list when no laporan exist', async () => {
      const res = await request(app)
        .get('/api/v1/laporan')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    test('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/laporan');
      expect(res.status).toBe(401);
    });

    test('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/laporan')
        .set('Authorization', 'Bearer invalid_token');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/laporan/:periode', () => {
    test('should return laporan by periode', async () => {
      await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ tahun: 2024, bulan: 6 });

      const res = await request(app)
        .get('/api/v1/laporan/2024-06')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.periode).toBe('2024-06');
      expect(res.body.data).toHaveProperty('total_pemasukan');
      expect(res.body.data).toHaveProperty('total_pengeluaran');
    });

    test('should return 404 for non-existent periode', async () => {
      const res = await request(app)
        .get('/api/v1/laporan/2025-01')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('failed');
      expect(res.body.message).toBe('Laporan tidak ditemukan');
    });

    test('should return 400 for invalid periode format', async () => {
      const res = await request(app)
        .get('/api/v1/laporan/invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('failed');
    });

    test('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/laporan/2024-06');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/laporan/rekap', () => {
    test('should rekap laporan successfully', async () => {
      await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ tahun: 2024, bulan: 6 });

      const res = await request(app)
        .post('/api/v1/laporan/rekap')
        .set('Authorization', `Bearer ${token}`)
        .send({ tanggal: '2024-06-15' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Rekap berhasil diperbarui');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('should return empty array when no laporan covers the date', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/rekap')
        .set('Authorization', `Bearer ${token}`)
        .send({ tanggal: '2024-06-15' });

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    test('should return 400 if tanggal is missing', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/rekap')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('failed');
    });

    test('should return 400 if tanggal format is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/laporan/rekap')
        .set('Authorization', `Bearer ${token}`)
        .send({ tanggal: '15-06-2024' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('failed');
    });
  });

  describe('DELETE /api/v1/laporan/:id_laporan', () => {
    test('should delete laporan successfully', async () => {
      const createRes = await request(app)
        .post('/api/v1/laporan/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ tahun: 2024, bulan: 6 });
      const idLaporan = createRes.body.data.id_laporan;

      const res = await request(app)
        .delete(`/api/v1/laporan/${idLaporan}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Laporan berhasil dihapus');
      expect(res.body.data.id_laporan).toBe(idLaporan);
    });

    test('should return 404 for non-existent laporan', async () => {
      const res = await request(app)
        .delete('/api/v1/laporan/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('failed');
      expect(res.body.message).toBe('Laporan tidak ditemukan');
    });

    test('should return 400 for invalid ID format', async () => {
      const res = await request(app)
        .delete('/api/v1/laporan/abc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('failed');
    });

    test('should return 401 without token', async () => {
      const res = await request(app).delete('/api/v1/laporan/1');
      expect(res.status).toBe(401);
    });
  });
});
