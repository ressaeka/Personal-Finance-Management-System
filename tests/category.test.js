import { prisma, app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

let token;

beforeAll(async () => {
  await request.post("/api/v1/auth/register").send({
    username: "catuser",
    email: "cat@example.com",
    password: "Test123!",
  });
  const login = await request.post("/api/v1/auth/login").send({
    username: "catuser",
    password: "Test123!",
  });
  token = login.body.data.token;
});

afterAll(async () => {
  await prisma.user.deleteMany();
});

describe("POST /api/v1/category", () => {
  afterEach(async () => {
    await prisma.category.deleteMany();
  });

  it("should create a pemasukan category", async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });

    expect(res.status).toBe(201);
    expect(res.body.data.nameCategory).toBe("Gaji");
    expect(res.body.data.tipe).toBe("PEMASUKAN");
  });

  it("should create a pengeluaran category", async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Makanan", tipe: "PENGELUARAN" });

    expect(res.status).toBe(201);
    expect(res.body.data.tipe).toBe("PENGELUARAN");
  });

  it("should reject duplicate nameCategory", async () => {
    await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });

    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });

    expect(res.status).toBe(409);
  });

  it("should reject without auth", async () => {
    const res = await request
      .post("/api/v1/category")
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });

    expect(res.status).toBe(401);
  });

  it("should reject invalid tipe value", async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Test", tipe: "INVALID" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/category", () => {
  beforeEach(async () => {
    await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });
    await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Makanan", tipe: "PENGELUARAN" });
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
  });

  it("should return paginated categories", async () => {
    const res = await request
      .get("/api/v1/category?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.totalData).toBe(2);
    expect(res.body.data.data.length).toBe(2);
  });
});

describe("GET /api/v1/category/:id", () => {
  let categoryId;

  beforeEach(async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });
    categoryId = res.body.data.id;
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
  });

  it("should return category by id", async () => {
    const res = await request
      .get(`/api/v1/category/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.nameCategory).toBe("Gaji");
  });

  it("should return 404 for non-existent category", async () => {
    const res = await request
      .get("/api/v1/category/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/v1/category/:id", () => {
  let categoryId;

  beforeEach(async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });
    categoryId = res.body.data.id;
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
  });

  it("should update category name", async () => {
    const res = await request
      .put(`/api/v1/category/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji Bulanan" });

    expect(res.status).toBe(200);
    expect(res.body.data.nameCategory).toBe("Gaji Bulanan");
  });

  it("should reject duplicate name on update", async () => {
    await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Makanan", tipe: "PENGELUARAN" });

    const res = await request
      .put(`/api/v1/category/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Makanan" });

    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/v1/category/:id", () => {
  let categoryId;

  beforeEach(async () => {
    const res = await request
      .post("/api/v1/category")
      .set("Authorization", `Bearer ${token}`)
      .send({ nameCategory: "Gaji", tipe: "PEMASUKAN" });
    categoryId = res.body.data.id;
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
  });

  it("should soft-delete category", async () => {
    const res = await request
      .delete(`/api/v1/category/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deletedAt).toBeDefined();
  });
});
