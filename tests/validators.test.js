import { prisma, app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

let token;

beforeAll(async () => {
  await request.post("/api/v1/auth/register").send({
    username: "validuser",
    email: "valid@example.com",
    password: "Test123!",
  });
  const login = await request.post("/api/v1/auth/login").send({
    username: "validuser",
    password: "Test123!",
  });
  token = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.user.deleteMany();
});

describe("Validator edge cases — laporan", () => {
  it("should reject startDate without endDate", async () => {
    const res = await request
      .get("/api/v1/laporan?startDate=2026-07-01")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("startDate");
  });

  it("should reject endDate before startDate", async () => {
    const res = await request
      .get("/api/v1/laporan?startDate=2026-07-31&endDate=2026-07-01")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("should reject invalid date format", async () => {
    const res = await request
      .get("/api/v1/laporan?startDate=31-07-2026&endDate=31-07-2026")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("should reject invalid tipe", async () => {
    const res = await request
      .get("/api/v1/laporan?tipe=INVALID")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("should reject non-numeric categoryId", async () => {
    const res = await request
      .get("/api/v1/laporan?categoryId=abc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe("Validator edge cases — transaksi", () => {
  it("should reject non-numeric categoryId in params", async () => {
    const res = await request
      .get("/api/v1/transaksi/abc")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("should reject negative jumlah", async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: 1, jumlah: -100 });

    expect(res.status).toBe(400);
  });

  it("should reject deskripsi shorter than 3 chars", async () => {
    const res = await request
      .post("/api/v1/transaksi")
      .set("Authorization", `Bearer ${token}`)
      .send({ categoryId: 1, jumlah: 100, deskripsi: "ab" });

    expect(res.status).toBe(400);
  });
});

describe("Validator edge cases — category", () => {
  it("should reject nameCategory shorter than 3 chars", async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "ab", tipe: "PEMASUKAN" });

    expect(res.status).toBe(400);
  });

  it("should reject invalid tipe", async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "INVALID" });

    expect(res.status).toBe(400);
  });
});

describe("Validator edge cases — auth", () => {
  it("should reject invalid email on register", async () => {
    const res = await request
      .post("/api/v1/auth/register")
      .send({ username: "validuser", email: "not-an-email", password: "Test123!" });

    expect(res.status).toBe(400);
  });

  it("should reject empty update body", async () => {
    const res = await request
      .put("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("satu field");
  });

  it("should reject reset password with empty token", async () => {
    const res = await request
      .post("/api/v1/auth/reset-password")
      .send({ token: "", password: "Test123!" });

    expect(res.status).toBe(400);
  });
});
