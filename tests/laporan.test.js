import { prisma, app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

let token;
let incomeCategoryId;
let expenseCategoryId;

beforeAll(async () => {
  await request.post("/api/v1/auth/register").send({
    username: "laporuser",
    email: "lapor@example.com",
    password: "Test123!",
  });
  const login = await request.post("/api/v1/auth/login").send({
    username: "laporuser",
    password: "Test123!",
  });
  token = login.body.data.token;

  const income = await request
    .post("/api/v1/category")
    .set("Authorization", `Bearer ${token}`)
    .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });
  incomeCategoryId = income.body.data.id;

  const expense = await request
    .post("/api/v1/category")
    .set("Authorization", `Bearer ${token}`)
    .send({ nameCategory: "Makanan", tipe: "PENGELUARAN" });
  expenseCategoryId = expense.body.data.id;
});

afterAll(async () => {
  await prisma.transaksi.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

describe("GET /api/v1/laporan", () => {
  beforeAll(async () => {
    await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: incomeCategoryId, jumlah: 5000000, deskripsi: "Gaji Juli" });
    await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: incomeCategoryId, jumlah: 3000000, deskripsi: "Bonus" });
    await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: expenseCategoryId, jumlah: 25000, deskripsi: "Makan siang" });
    await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: expenseCategoryId, jumlah: 50000, deskripsi: "Bensin" });
  });

  afterAll(async () => {
    await prisma.transaksi.deleteMany();
  });

  it("should return report with pagination and summary", async () => {
    const res = await request
      .get("/api/v1/laporan?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    console.log("LAPORAN GET RESPONSE:", res.body);
    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.totalData).toBe(4);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.totalTransactions).toBe(4);
    expect(res.body.data.transactions.length).toBe(4);
  });

  it("should filter by categoryId", async () => {
    const res = await request
      .get(`/api/v1/laporan?categoryId=${expenseCategoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.totalData).toBe(2);
  });

  it("should filter by tipe", async () => {
    const res = await request
      .get(`/api/v1/laporan?tipe=PENGELUARAN`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.totalData).toBe(2);
  });

  it("should filter by date range", async () => {
    const res = await request
      .get("/api/v1/laporan?startDate=2026-07-01&endDate=2026-07-31")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
  });

  it("should reject without auth", async () => {
    const res = await request.get("/api/v1/laporan");

    expect(res.status).toBe(401);
  });
});
