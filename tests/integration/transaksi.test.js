import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/prisma.js";

let token;
let id_category;

const cleanDatabase = async () => {
  await prisma.transaksi.deleteMany();
  await prisma.category.deleteMany();
  await prisma.users.deleteMany();
};

const registerAndLogin = async () => {
  const userData = {
    username: "trx_testuser",
    email: "trx_test@example.com",
    password: "Test123!xyz",
  };
  await request(app).post("/api/v1/auth/register").send(userData);
  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({ username: "trx_testuser", password: "Test123!xyz" });
  token = loginRes.body.data.token;
};

const createCategory = async (nama, tipe) => {
  const res = await request(app)
    .post("/api/v1/category")
    .set("Authorization", `Bearer ${token}`)
    .send({ nama_category: nama, tipe });
  id_category = res.body.data.id_category;
};

describe("Transaksi API Integration (Real Database)", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
  });

  beforeEach(async () => {
    await cleanDatabase();
    await registerAndLogin();
    await createCategory("Makanan", "pengeluaran");
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("POST /api/v1/transaksi", () => {
    test("should create transaksi successfully", async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 50000, deskripsi: "Belanja", tanggal: "2024-06-15" });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Transaksi berhasil dibuat");
      expect(res.body.data.id_category).toBe(id_category);
      expect(res.body.data.deskripsi).toBe("Belanja");
    });

    test("should create transaksi without deskripsi", async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 25000, tanggal: "2024-06-15" });

      expect(res.status).toBe(201);
      expect(res.body.data.deskripsi).toBeNull();
    });

    test("should return 401 without token", async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .send({ id_category, jumlah: 50000, tanggal: "2024-06-15" });

      expect(res.status).toBe(401);
    });

    test("should return 401 with invalid token", async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", "Bearer invalid_token")
        .send({ id_category, jumlah: 50000, tanggal: "2024-06-15" });

      expect(res.status).toBe(401);
    });

    test("should return 400 when id_category is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category: "abc", jumlah: 50000, tanggal: "2024-06-15" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("failed");
    });

    test("should return 400 when tanggal format is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 50000, tanggal: "15-06-2024" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("failed");
    });

    test("should return 404 when category does not exist", async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category: 99999, jumlah: 50000, tanggal: "2024-06-15" });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe("failed");
      expect(res.body.message).toBe("Category tidak ditemukan");
    });
  });

  describe("GET /api/v1/transaksi", () => {
    test("should return all transaksi for authenticated user", async () => {
      await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 50000, tanggal: "2024-06-15" });
      await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 25000, tanggal: "2024-06-16" });

      const res = await request(app)
        .get("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.transaksi).toBeDefined();
      expect(res.body.data.transaksi).toHaveLength(2);
    });

    test("should return empty list when no transaksi exist", async () => {
      const res = await request(app)
        .get("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.transaksi).toHaveLength(0);
    });

    test("should return 401 without token", async () => {
      const res = await request(app).get("/api/v1/transaksi");

      expect(res.status).toBe(401);
    });

    test("should only return transaksi for the authenticated user", async () => {
      await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 50000, tanggal: "2024-06-15" });

      const userData2 = {
        username: "trx_testuser2",
        email: "trx_test2@example.com",
        password: "Test123!xyz",
      };
      await request(app).post("/api/v1/auth/register").send(userData2);
      const loginRes2 = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "trx_testuser2", password: "Test123!xyz" });
      const token2 = loginRes2.body.data.token;

      const catRes2 = await request(app)
        .post("/api/v1/category")
        .set("Authorization", `Bearer ${token2}`)
        .send({ nama_category: "Makanan", tipe: "pengeluaran" });
      const id_category2 = catRes2.body.data.id_category;

      await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token2}`)
        .send({ id_category: id_category2, jumlah: 10000, tanggal: "2024-06-15" });

      const res = await request(app)
        .get("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.transaksi).toHaveLength(1);
    });
  });

  describe("GET /api/v1/transaksi/:id_transaksi", () => {
    let createdTransaksiId;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 50000, deskripsi: "Belanja", tanggal: "2024-06-15" });
      createdTransaksiId = res.body.data.id_transaksi;
    });

    test("should return transaksi by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/transaksi/${createdTransaksiId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.transaksi.id_transaksi).toBe(createdTransaksiId);
      expect(res.body.data.transaksi.deskripsi).toBe("Belanja");
    });

    test("should return 404 for non-existent transaksi", async () => {
      const res = await request(app)
        .get("/api/v1/transaksi/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe("failed");
      expect(res.body.message).toBe("Transaksi tidak ditemukan");
    });

    test("should return 400 for invalid ID format", async () => {
      const res = await request(app)
        .get("/api/v1/transaksi/abc")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("failed");
      expect(res.body.message).toBe("ID transaksi tidak valid");
    });

    test("should return 401 without token", async () => {
      const res = await request(app).get(`/api/v1/transaksi/${createdTransaksiId}`);

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/transaksi/:id_transaksi", () => {
    let createdTransaksiId;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 50000, deskripsi: "Belanja", tanggal: "2024-06-15" });
      createdTransaksiId = res.body.data.id_transaksi;
    });

    test("should update transaksi successfully", async () => {
      const res = await request(app)
        .put(`/api/v1/transaksi/${createdTransaksiId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 75000, deskripsi: "Belanja bulanan", tanggal: "2024-06-20" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.deskripsi).toBe("Belanja bulanan");
    });

    test("should return 404 for non-existent transaksi", async () => {
      const res = await request(app)
        .put("/api/v1/transaksi/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 75000, tanggal: "2024-06-20" });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe("failed");
      expect(res.body.message).toBe("Transaksi tidak ditemukan");
    });

    test("should return 400 for invalid ID", async () => {
      const res = await request(app)
        .put("/api/v1/transaksi/abc")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 75000, tanggal: "2024-06-20" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("failed");
    });

    test("should return 401 without token", async () => {
      const res = await request(app)
        .put(`/api/v1/transaksi/${createdTransaksiId}`)
        .send({ id_category, jumlah: 75000, tanggal: "2024-06-20" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/v1/transaksi/:id_transaksi", () => {
    let createdTransaksiId;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/v1/transaksi")
        .set("Authorization", `Bearer ${token}`)
        .send({ id_category, jumlah: 50000, deskripsi: "Belanja", tanggal: "2024-06-15" });
      createdTransaksiId = res.body.data.id_transaksi;
    });

    test("should delete transaksi successfully", async () => {
      const res = await request(app)
        .delete(`/api/v1/transaksi/${createdTransaksiId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Transaksi berhasil dihapus");

      const getRes = await request(app)
        .get(`/api/v1/transaksi/${createdTransaksiId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getRes.status).toBe(404);
      expect(getRes.body.message).toBe("Transaksi tidak ditemukan");
    });

    test("should return 404 for already deleted transaksi", async () => {
      await request(app)
        .delete(`/api/v1/transaksi/${createdTransaksiId}`)
        .set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .delete(`/api/v1/transaksi/${createdTransaksiId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
            expect(res.body.status).toBe("failed");
            expect(res.body.message).toBe("Transaksi tidak ditemukan");
    });

    test("should return 404 for non-existent transaksi", async () => {
      const res = await request(app)
        .delete("/api/v1/transaksi/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe("failed");
    });

    test("should return 400 for invalid ID", async () => {
      const res = await request(app)
        .delete("/api/v1/transaksi/abc")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("failed");
    });

    test("should return 401 without token", async () => {
      const res = await request(app).delete(`/api/v1/transaksi/${createdTransaksiId}`);

      expect(res.status).toBe(401);
    });
  });
});
