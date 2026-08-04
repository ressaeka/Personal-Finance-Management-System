import { prisma, app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

describe("E2E: full user journey", () => {
  let accessToken;
  let refreshToken;
  let pemasukanCategoryId;
  let pengeluaranCategoryId;

  afterAll(async () => {
    await prisma.transaksi.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  it("1. register a new user", async () => {
    const res = await request.post("/api/v1/auth/register").send({
      username: "e2euser",
      email: "e2e@example.com",
      password: "Test123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.username).toBe("e2euser");
  });

  it("2. login and receive tokens", async () => {
    const res = await request.post("/api/v1/auth/login").send({
      username: "e2euser",
      password: "Test123!",
    });

    expect(res.status).toBe(200);
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it("3. create a PEMASUKAN category", async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });

    expect(res.status).toBe(201);
    pemasukanCategoryId = res.body.data.id;
  });

  it("4. create a PENGELUARAN category", async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ nameCategory: "Makanan", tipe: "PENGELUARAN" });

    expect(res.status).toBe(201);
    pengeluaranCategoryId = res.body.data.id;
  });

  it("5. record a pemasukan transaction", async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        categoryId: pemasukanCategoryId,
        jumlah: 5000000,
        deskripsi: "Gaji bulan Juli",
      });

    expect(res.status).toBe(201);
    expect(Number(res.body.data.jumlah)).toBe(5000000);
    expect(res.body.data.category.tipe).toBe("PEMASUKAN");
  });

  it("6. record a pengeluaran transaction (stored negative)", async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        categoryId: pengeluaranCategoryId,
        jumlah: 250000,
        deskripsi: "Belanja mingguan",
      });

    expect(res.status).toBe(201);
    expect(Number(res.body.data.jumlah)).toBe(-250000);
    expect(res.body.data.category.tipe).toBe("PENGELUARAN");
  });

  it("7. fetch laporan with correct summary", async () => {
    const res = await request.get("/api/v1/laporan").set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalTransactions).toBe(2);
    expect(Number(res.body.data.summary.totalAmount)).toBe(4750000);
    expect(Number(res.body.data.summary.highestTransaction)).toBe(5000000);
    expect(Number(res.body.data.summary.lowestTransaction)).toBe(-250000);
    expect(res.body.data.pagination.totalData).toBe(2);
    expect(res.body.data.categorySummary).toBeDefined();
  });

  it("8. refresh access token", async () => {
    const res = await request.post("/api/v1/auth/refresh").send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it("9. access profile with refreshed token", async () => {
    const res = await request
      .get("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("e2euser");
  });

  it("10. logout", async () => {
    const res = await request
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Logout");
  });
});
