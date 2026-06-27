-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "category" (
    "id_category" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "nama_category" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id_category")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id_transaksi" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_category" INTEGER NOT NULL,
    "jumlah" DECIMAL(12,2) NOT NULL,
    "deskripsi" TEXT,
    "catatan" TEXT,
    "tanggal" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateTable
CREATE TABLE "laporan" (
    "id_laporan" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "periode" TEXT NOT NULL,
    "tanggal_awal" DATE NOT NULL,
    "tanggal_akhir" DATE NOT NULL,
    "total_pemasukan" DECIMAL NOT NULL DEFAULT 0,
    "total_pengeluaran" DECIMAL NOT NULL DEFAULT 0,
    "saldo" DECIMAL NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laporan_pkey" PRIMARY KEY ("id_laporan")
);

-- CreateTable
CREATE TABLE "token_blacklist" (
    "jti" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("jti")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_id_user_nama_category_key" ON "category"("id_user", "nama_category");

-- CreateIndex
CREATE INDEX "transaksi_id_user_created_at_idx" ON "transaksi"("id_user", "created_at");

-- CreateIndex
CREATE INDEX "laporan_tanggal_awal_tanggal_akhir_idx" ON "laporan"("tanggal_awal", "tanggal_akhir");

-- CreateIndex
CREATE UNIQUE INDEX "laporan_id_user_periode_key" ON "laporan"("id_user", "periode");

-- CreateIndex
CREATE INDEX "token_blacklist_created_at_idx" ON "token_blacklist"("created_at");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "category"("id_category") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
