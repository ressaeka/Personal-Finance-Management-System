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
            expect(res.body.status).toBe("Success");
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
            expect(res.body.status).toBe("Success");
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

        test("should return 400 when nama_category is too short", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "ab", tipe: "pengeluaran" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should return 400 when tipe is invalid", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "investasi" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should return 400 when tipe is empty", async () => {
            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should return 400 when nama_category is duplicate for same user", async () => {
            await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should allow same category name for different users", async () => {
            await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

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

            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", `Bearer ${token2}`)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

            expect(res.status).toBe(201);
            expect(res.body.data.nama_category).toBe("Makanan");
        });
    });
});
