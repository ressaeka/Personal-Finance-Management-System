# KPS Tracking API

[![CI](https://github.com/ressaeka/Personal-Finance-Management-System/actions/workflows/ci.yml/badge.svg)](https://github.com/ressaeka/Personal-Finance-Management-System/actions/workflows/ci.yml)

REST API untuk aplikasi **KPS Tracking** — sistem pencatatan keuangan pribadi yang mencatat **pemasukan** dan **pengeluaran**, mengelompokkannya ke dalam kategori, serta menyajikan **laporan keuangan** (ringkasan total, rata-rata, transaksi tertinggi/terendah, dan breakdown per kategori) dalam satu halaman.

Dibangun dengan arsitektur **layered (Route → Controller → Service → Repository)** yang clean dan mudah diuji, plus praktik keamanan level produksi.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js 22 (ES Modules) |
| Framework | Express 5 |
| Database | PostgreSQL + Prisma ORM 7 |
| Cache / Refresh Token | Redis (ioredis) |
| Autentikasi | JWT (access + refresh token) |
| Validasi | Zod 4 |
| Logging | Pino + pino-http (dengan redaction otomatis) |
| Testing | Jest + Supertest (182 test) |
| Dokumentasi API | Swagger UI |
| Deployment | Docker (dev & prod) + docker-compose |

## Fitur

- **Autentikasi lengkap**: register, login, refresh token, logout, forgot/reset password via email (Nodemailer)
- **Manajemen kategori**: kategori pemasukan/pengeluaran per user, soft delete
- **Manajemen transaksi**: catat pemasukan/pengeluaran dengan deskripsi & tanggal, soft delete
- **Laporan keuangan**: ringkasan, breakdown per kategori, filter tanggal/kategori/tipe, pagination
- **Keamanan**: bcrypt (cost 12), JWT dua jenis token, refresh token di Redis dengan fitur *revoke all sessions*, rate limiting, CORS whitelist, Helmet, redaction data sensitif di log
- **Health check**: ping database + Redis, laporan status per-service
- **Dokumentasi API**: Swagger UI (dilindungi basic auth)

## Arsitektur

```
src/
├── routes/          # Definisi endpoint + middleware chain
├── controllers/     # Handler request, parsing input, response
├── services/        # Business logic
├── repositories/    # Akses data (Prisma)
├── middleware/      # Auth, validate, rate limit, CORS, helmet, logger, error handler
├── validators/      # Skema Zod untuk semua input
├── config/          # Prisma, Redis, logger, Swagger
├── utils/           # AppError, response helper, bcrypt, jwt
└── app.js           # Setup express + mounting routes
```

Alur request: `Route → Validator (Zod) → Middleware (Auth) → Controller → Service → Repository → Database`.

## Quick Start

### Prasyarat

- Node.js 22+
- PostgreSQL (atau Supabase)
- Redis

### 1. Install dependensi

```bash
npm install
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Isi semua variabel di `.env` (lihat tabel di bawah).

### 3. Setup database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed data awal (opsional)

Mengisi user admin + kategori + transaksi contoh (idempotent, aman dijalankan ulang):

```bash
npm run db:seed
```

Akun default: `admin` / `Admin123!`

### 5. Jalankan server

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`. Cek status: `GET /health`.

### 6. Menjalankan test

```bash
npm test
```

Test memakai database terpisah (`DATABASE_URL_TEST`) dan di-reset otomatis di setiap sesi test.

## Environment Variables

| Variabel | Deskripsi |
|---|---|
| `PORT` | Port server (default `3000`) |
| `NODE_ENV` | `development` / `test` / `production` |
| `JWT_SECRET` | Secret untuk access token (15 menit) |
| `JWT_REFRESH_SECRET` | Secret untuk refresh token (7 hari) |
| `JWT_RESET_SECRET` | Secret untuk token reset password (15 menit) |
| `DATABASE_URL` | Koneksi Prisma (produksi/dev) |
| `DIRECT_URL` | Koneksi langsung (untuk Supabase/Prisma) |
| `DATABASE_URL_TEST` | Koneksi database test |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Konfigurasi Redis |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP untuk email reset password |
| `FRONTEND_URL` | URL frontend untuk link reset password |
| `CORS_ORIGINS` | Daftar origin yang diizinkan (pisahkan koma) |
| `ENABLE_SWAGGER` | `true` untuk mengaktifkan `/api-docs` |
| `SWAGGER_USER` / `SWAGGER_PASSWORD` | Kredensial basic auth Swagger |

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/auth/register` | Daftar akun baru | - |
| POST | `/auth/login` | Login, mengembalikan access + refresh token | - |
| POST | `/auth/refresh` | Perbarui access token dengan refresh token | - |
| POST | `/auth/logout` | Logout, hapus refresh token dari Redis | ✅ |
| GET | `/auth/profile` | Ambil data profil user | ✅ |
| PUT | `/auth/profile` | Update profil (username/email/password) | ✅ |
| POST | `/auth/forgot-password` | Kirim link reset password ke email | - |
| POST | `/auth/reset-password` | Reset password dengan token | - |

### Category

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/category` | Buat kategori (`nameCategory`, `tipe: PEMASUKAN/PENGELUARAN`) | ✅ |
| GET | `/category` | List kategori (pagination) | ✅ |
| GET | `/category/:id` | Detail kategori | ✅ |
| PUT | `/category/:id` | Update kategori | ✅ |
| DELETE | `/category/:id` | Hapus kategori (soft delete) | ✅ |

### Transaksi

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/transaksi` | Catat transaksi (`categoryId`, `jumlah`, `deskripsi?`, `tanggal?`) | ✅ |
| GET | `/transaksi` | List transaksi (pagination) | ✅ |
| GET | `/transaksi/:id` | Detail transaksi | ✅ |
| PUT | `/transaksi/:id` | Update transaksi | ✅ |
| DELETE | `/transaksi/:id` | Hapus transaksi (soft delete) | ✅ |

### Laporan

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/laporan` | Laporan keuangan: summary, breakdown kategori, transaksi | ✅ |

Query params laporan: `page`, `limit`, `categoryId`, `tipe`, `startDate` + `endDate` (format `YYYY-MM-DD`, harus diisi bersamaan).

### Health

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/health` | Status server + ping database & Redis (200 ok / 503 degraded) |

Dokumentasi interaktif: `GET /api-docs` (aktif saat `ENABLE_SWAGGER=true`).

## Format Response

Semua endpoint mengembalikan format konsisten:

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": { }
}
```

Error:

```json
{
  "status": "failed",
  "message": "Username atau password salah"
}
```

Semua request ke endpoint bisnis wajib membawa header `Authorization: Bearer <accessToken>`.

## Keamanan

- Password di-hash dengan **bcrypt cost 12**
- **Access token (15 menit)** + **refresh token (7 hari)** dengan secret terpisah
- Refresh token disimpan di **Redis** — logout & reset password me-revoke semua sesi aktif
- **Rate limiting** di semua endpoint auth (20 req/15 menit) + limiter global (100 req/15 menit); endpoint `/health` dikecualikan
- **CORS whitelist** via `CORS_ORIGINS`
- **Helmet** untuk HTTP security headers
- **Redaction** di logging: `authorization`, `cookie`, `password`, `refreshToken` otomatis disamarkan
- Validasi input **Zod** di semua endpoint
- Forgot password tidak membocorkan apakah email terdaftar (selalu return 200)
- Body limit 10kb, graceful shutdown (SIGTERM/SIGINT)

## Testing

57 test dalam 5 suite (Jest + Supertest):

```
npm test          # jalankan sekali
npm run test:watch
npm run coverage
```

## Docker

```bash
docker-compose up --build    # app + redis + cloudflared tunnel
```

Tersedia `Dockerfile.dev` (hot reload, nodemon) dan `Dockerfile.prod` (multi-purpose, `npm ci`, user non-root).
