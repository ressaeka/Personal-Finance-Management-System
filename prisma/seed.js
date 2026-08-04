import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl =
  process.env.NODE_ENV === "test" ? process.env.DATABASE_URL_TEST : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL belum dikonfigurasi");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

const ADMIN = {
  username: "admin",
  email: "admin@example.com",
  password: "Admin123!",
};

const CATEGORIES = [
  { nameCategory: "Gaji", tipe: "PEMASUKAN" },
  { nameCategory: "Bonus", tipe: "PEMASUKAN" },
  { nameCategory: "Makanan", tipe: "PENGELUARAN" },
  { nameCategory: "Transportasi", tipe: "PENGELUARAN" },
  { nameCategory: "Tagihan", tipe: "PENGELUARAN" },
];

const TRANSACTIONS = [
  {
    category: "Gaji",
    jumlah: 5000000,
    deskripsi: "Gaji bulan Juli",
    tanggal: new Date("2026-07-01"),
  },
  {
    category: "Bonus",
    jumlah: 1000000,
    deskripsi: "Bonus proyek",
    tanggal: new Date("2026-07-15"),
  },
  {
    category: "Makanan",
    jumlah: -250000,
    deskripsi: "Belanja mingguan",
    tanggal: new Date("2026-07-05"),
  },
  {
    category: "Transportasi",
    jumlah: -150000,
    deskripsi: "Bensin sebulan",
    tanggal: new Date("2026-07-10"),
  },
  {
    category: "Tagihan",
    jumlah: -500000,
    deskripsi: "Listrik & Internet",
    tanggal: new Date("2026-07-20"),
  },
];

async function main() {
  const hashedPassword = await bcrypt.hash(ADMIN.password, 12);

  const admin = await prisma.user.upsert({
    where: {
      username: ADMIN.username,
    },
    update: {},
    create: {
      username: ADMIN.username,
      email: ADMIN.email,
      password: hashedPassword,
    },
  });

  const categoryIds = new Map();

  for (const category of CATEGORIES) {
    const createdCategory = await prisma.category.upsert({
      where: {
        userId_nameCategory: {
          userId: admin.id,
          nameCategory: category.nameCategory,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        nameCategory: category.nameCategory,
        tipe: category.tipe,
      },
    });

    categoryIds.set(category.nameCategory, createdCategory.id);
  }

  const existingTransactions = await prisma.transaksi.count({
    where: {
      userId: admin.id,
    },
  });

  if (existingTransactions === 0) {
    await prisma.transaksi.createMany({
      data: TRANSACTIONS.map((transaction) => ({
        userId: admin.id,
        categoryId: categoryIds.get(transaction.category),
        jumlah: new Prisma.Decimal(transaction.jumlah),
        deskripsi: transaction.deskripsi,
        tanggal: transaction.tanggal,
      })),
    });
  }

  console.log("================================");
  console.log("Seed berhasil");
  console.log("================================");
  console.log(`Username : ${ADMIN.username}`);
  console.log(`Password : ${ADMIN.password}`);
  console.log(`Kategori : ${CATEGORIES.length}`);
  console.log(`Transaksi: ${TRANSACTIONS.length}`);
  console.log("================================");
}

main()
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
