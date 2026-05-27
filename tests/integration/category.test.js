import request from "supertest";
import app from "../../src/app.js";
import pool from "../../src/config/database.js";

let token;
let id_user;

const cleanDatabase = async () => {
    await pool.query("DELETE FROM category");
    await pool.query("DELETE FROM users");
};

const registerAndLogin = async () => {
    const userData = {
        username: "cat_testuser",
        email: "cat_test@example.com",
        password: "Test123!xyz"
    };
    await request(app).post("/api/v1/auth/register").send(userData);
    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ username: "cat_testuser", password: "Test123!xyz" });
    token = loginRes.body.token;
    id_user = loginRes.body.data.id_user;
};

describe("Category API Integration (Real Database)", () => {
    beforeAll(async () => {
        process.env.NODE_ENV = "test";
    });

    beforeEach(async () => {
        await cleanDatabase();
        await registerAndLogin();
    });

    afterAll(async () => {
        await cleanDatabase();
        await pool.end();
    });

    describe("POST /api/v1/category", () => {
        test("should create category with tipe pengeluaran", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("Category berhasil dibuat");
            expect(res.body.data.nama_category).toBe("Makanan");
            expect(res.body.data.tipe).toBe("pengeluaran");
            expect(res.body.data).toHaveProperty("id_category");
        });

        test("should create category with tipe pemasukan", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Gaji", tipe: "pemasukan" });

            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.data.nama_category).toBe("Gaji");
            expect(res.body.data.tipe).toBe("pemasukan");
        });

        test("should return 401 without token", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

            expect(res.status).toBe(401);
        });

        test("should return 401 with invalid token", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", "Bearer invalid_token")
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

            expect(res.status).toBe(401);
        });

        test("should return 400 when nama_category is empty", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "", tipe: "pengeluaran" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });
    });

    describe("GET /api/v1/category", () => {
        test("should return all categories for authenticated user", async () => {
            await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });
            await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Gaji", tipe: "pemasukan" });

            const res = await request(app)
                .get("/api/v1/category")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("Berhasil mengambil semua Category");
            expect(res.body.data.category).toBeDefined();
            expect(res.body.data.category).toHaveLength(2);
        });

        test("should return empty list when no categories exist", async () => {
            const res = await request(app)
                .get("/api/v1/category")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.category).toHaveLength(0);
        });

        test("should return 401 without token", async () => {
            const res = await request(app).get("/api/v1/category");

            expect(res.status).toBe(401);
        });

        test("should return 401 with invalid token", async () => {
            const res = await request(app)
                .get("/api/v1/category")
                .set("Authorization", "Bearer invalid_token");

            expect(res.status).toBe(401);
        });

        test("should only return categories for the authenticated user", async () => {
            await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "User1 Category", tipe: "pemasukan" });

            const userData2 = {
                username: "cat_testuser2",
                email: "cat_test2@example.com",
                password: "Test123!xyz"
            };
            await request(app).post("/api/v1/auth/register").send(userData2);
            const loginRes2 = await request(app)
                .post("/api/v1/auth/login")
                .send({ username: "cat_testuser2", password: "Test123!xyz" });
            const token2 = loginRes2.body.token;

            await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token2}`)
                .send({ nama_category: "User2 Category", tipe: "pengeluaran" });

            const res = await request(app)
                .get("/api/v1/category")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.category).toHaveLength(1);
            expect(res.body.data.category[0].nama_category).toBe("User1 Category");
        });
    });

    describe("GET /api/v1/category/:id_category", () => {
        let createdCategoryId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });
            createdCategoryId = res.body.data.id_category;
        });

        test("should return category by ID", async () => {
            const res = await request(app)
                .get(`/api/v1/category/${createdCategoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.category.nama_category).toBe("Makanan");
            expect(res.body.data.category.tipe).toBe("pengeluaran");
        });

        test("should return 404 for non-existent category", async () => {
            const res = await request(app)
                .get("/api/v1/category/99999")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.status).toBe("failed");
            expect(res.body.message).toBe("Category tidak ditemukan");
        });

        test("should return 400 for invalid ID format", async () => {
            const res = await request(app)
                .get("/api/v1/category/abc")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
            expect(res.body.message).toBe("ID category tidak valid");
        });

        test("should return 401 without token", async () => {
            const res = await request(app)
                .get(`/api/v1/category/${createdCategoryId}`);

            expect(res.status).toBe(401);
        });
    });

    describe("PUT /api/v1/category/:id_category", () => {
        let createdCategoryId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });
            createdCategoryId = res.body.data.id_category;
        });

        test("should update category successfully", async () => {
            const res = await request(app)
                .put(`/api/v1/category/${createdCategoryId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Minuman", tipe: "pengeluaran" });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.nama_category).toBe("Minuman");
        });

        test("should return 404 for non-existent category", async () => {
            const res = await request(app)
                .put("/api/v1/category/99999")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Minuman", tipe: "pengeluaran" });

            expect(res.status).toBe(404);
            expect(res.body.status).toBe("failed");
        });

        test("should return 400 for invalid ID", async () => {
            const res = await request(app)
                .put("/api/v1/category/abc")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Minuman", tipe: "pengeluaran" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should return 400 for invalid nama_category", async () => {
            const res = await request(app)
                .put(`/api/v1/category/${createdCategoryId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "ab", tipe: "pengeluaran" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should return 401 without token", async () => {
            const res = await request(app)
                .put(`/api/v1/category/${createdCategoryId}`)
                .send({ nama_category: "Minuman", tipe: "pengeluaran" });

            expect(res.status).toBe(401);
        });
    });

    describe("DELETE /api/v1/category/:id_category", () => {
        let createdCategoryId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });
            createdCategoryId = res.body.data.id_category;
        });

        test("should delete category successfully (soft delete)", async () => {
            const res = await request(app)
                .delete(`/api/v1/category/${createdCategoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("Category berhasil dihapus");

            const getRes = await request(app)
                .get(`/api/v1/category/${createdCategoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(getRes.status).toBe(404);
            expect(getRes.body.message).toBe("Category tidak ditemukan");
        });

        test("should return 404 for already deleted category", async () => {
            await request(app)
                .delete(`/api/v1/category/${createdCategoryId}`)
                .set("Authorization", `Bearer ${token}`);

            const res = await request(app)
                .delete(`/api/v1/category/${createdCategoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.status).toBe("failed");
            expect(res.body.message).toBe("Category tidak ditemukan atau sudah dihapus");
        });

        test("should return 404 for non-existent category", async () => {
            const res = await request(app)
                .delete("/api/v1/category/99999")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.status).toBe("failed");
        });

        test("should return 400 for invalid ID", async () => {
            const res = await request(app)
                .delete("/api/v1/category/abc")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should return 401 without token", async () => {
            const res = await request(app)
                .delete(`/api/v1/category/${createdCategoryId}`);

            expect(res.status).toBe(401);
        });
    });
});
