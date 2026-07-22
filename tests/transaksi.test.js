import { prisma, app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

let token;
let incomeCategoryId;
let expenseCategoryId;

beforeAll(async () => {
  await request.post("/api/v1/auth/register").send({
    username: "transuser",
    email: "trans@example.com",
    password: "Test123!",
  });
  const login = await request.post("/api/v1/auth/login").send({
    username: "transuser",
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

describe("POST /api/v1/transaksi", () => {
  afterEach(async () => {
    await prisma.transaksi.deleteMany();
  });

  it("should create income transaction with positive amount", async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: incomeCategoryId,
        jumlah: 5000000,
        deskripsi: "Gaji bulan Juli",
        tanggal: "2026-07-21",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.jumlah).toBe("5000000");
  });

  it("should create expense transaction with negative amount", async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: expenseCategoryId,
        jumlah: 25000,
        deskripsi: "Nasi goreng",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.jumlah).toBe("-25000");
  });

  it("should reject non-existent category", async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: 99999,
        jumlah: 10000,
        deskripsi: "Test transaction",
      });

    expect(res.status).toBe(404);
  });

  it("should reject without auth", async () => {
    const res = await request.post("/api/v1/transaksi").send({
      categoryId: incomeCategoryId,
      jumlah: 10000,
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/transaksi", () => {
  beforeEach(async () => {
    await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: incomeCategoryId, jumlah: 5000000, deskripsi: "Gaji" });
    await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: expenseCategoryId, jumlah: 25000, deskripsi: "Makan siang" });
  });

  afterEach(async () => {
    await prisma.transaksi.deleteMany();
  });

  it("should return paginated transactions", async () => {
    const res = await request
      .get("/api/v1/transaksi?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.totalData).toBe(2);
    expect(res.body.data.data.length).toBe(2);
  });
});

describe("GET /api/v1/transaksi/:id", () => {
  let transaksiId;

  beforeEach(async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: incomeCategoryId, jumlah: 5000000, deskripsi: "Gaji" });
    transaksiId = res.body.data.id;
  });

  afterEach(async () => {
    await prisma.transaksi.deleteMany();
  });

  it("should return transaction by id", async () => {
    const res = await request
      .get(`/api/v1/transaksi/${transaksiId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.jumlah).toBeDefined();
  });

  it("should return 404 for non-existent transaction", async () => {
    const res = await request
      .get("/api/v1/transaksi/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/v1/transaksi/:id", () => {
  let transaksiId;

  beforeEach(async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: incomeCategoryId, jumlah: 5000000, deskripsi: "Gaji" });
    transaksiId = res.body.data.id;
  });

  afterEach(async () => {
    await prisma.transaksi.deleteMany();
  });

  it("should update transaction description", async () => {
    const res = await request
      .put(`/api/v1/transaksi/${transaksiId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ deskripsi: "Gaji bulan Juli" });

    expect(res.status).toBe(200);
    expect(res.body.data.deskripsi).toBe("Gaji bulan Juli");
  });
});

describe("DELETE /api/v1/transaksi/:id", () => {
  let transaksiId;

  beforeEach(async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: incomeCategoryId, jumlah: 5000000, deskripsi: "Gaji" });
    transaksiId = res.body.data.id;
  });

  afterEach(async () => {
    await prisma.transaksi.deleteMany();
  });

  it("should soft-delete transaction", async () => {
    const res = await request
      .delete(`/api/v1/transaksi/${transaksiId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deletedAt).toBeDefined();
  });
});
