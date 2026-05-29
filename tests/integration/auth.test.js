import request from "supertest";
import app from "../../src/app.js";
import pool from "../../src/config/database.js";

const cleanDatabase = async () => {
    await pool.query("DELETE FROM users");
};

const registerUser = async (data = {}) => {
    const payload = {
        username: data.username ?? "testuser",
        email: data.email ?? "testuser@example.com",
        password: data.password ?? "Test123!xyz"
    };
    return await request(app).post("/api/v1/auth/register").send(payload);
};

describe("Auth API Integration (Real Database)", () => {
    beforeAll(async () => {
        process.env.NODE_ENV = "test";
    });

    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await cleanDatabase();
        await pool.end();
    });

    describe("POST /auth/register", () => {
        test("should register a new user successfully", async () => {
            const res = await registerUser();

            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("Register Berhasil");
            expect(res.body.data.username).toBe("testuser");
            expect(res.body.data.email).toBe("testuser@example.com");
            expect(res.body.data).toHaveProperty("id_user");
        });

        test("should reject duplicate email", async () => {
            await registerUser();

            const res = await registerUser({
                username: "testuser2",
                email: "testuser@example.com"
            });

            expect(res.status).toBe(409);
            expect(res.body.status).toBe("failed");
            expect(res.body.message).toBe("Email sudah terdaftar");
        });

        test("should reject duplicate username", async () => {
            await registerUser();

            const res = await registerUser({
                username: "testuser",
                email: "other@example.com"
            });

            expect(res.status).toBe(409);
            expect(res.body.status).toBe("failed");
            expect(res.body.message).toBe("Username sudah terdaftar");
        });

        test("should reject weak password", async () => {
            const res = await registerUser({ password: "weak" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });
    });

    describe("POST /auth/login", () => {
        beforeEach(async () => {
            await registerUser();
        });

        test("should login successfully with correct credentials", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ username: "testuser", password: "Test123!xyz" });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("Login Berhasil");
            expect(res.body.data).toHaveProperty("token");
            expect(res.body.data.user.username).toBe("testuser");
        });

        test("should reject wrong password", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ username: "testuser", password: "WrongPass123" });

            expect(res.status).toBe(401);
            expect(res.body.status).toBe("failed");
        });

        test("should reject non-existent user", async () => {
            const res = await request(app)
                .post("/api/v1/auth/login")
                .send({ username: "nonexistent", password: "Test123!xyz" });

            expect(res.status).toBe(401);
            expect(res.body.status).toBe("failed");
        });
    });

    describe("GET /auth/profile", () => {
        let token;

        beforeEach(async () => {
            await registerUser();
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ username: "testuser", password: "Test123!xyz" });
            token = loginRes.body.data.token;
        });

        test("should return profile with valid token", async () => {
            const res = await request(app)
                .get("/api/v1/auth/profile")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.username).toBe("testuser");
        });

        test("should return 401 without token", async () => {
            const res = await request(app).get("/api/v1/auth/profile");

            expect(res.status).toBe(401);
        });

        test("should return 401 with invalid token", async () => {
            const res = await request(app)
                .get("/api/v1/auth/profile")
                .set("Authorization", "Bearer invalid_token");

            expect(res.status).toBe(401);
        });
    });

    describe("PUT /auth/profile", () => {
        let token;

        beforeEach(async () => {
            await registerUser();
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ username: "testuser", password: "Test123!xyz" });
            token = loginRes.body.data.token;
        });

        test("should update profile successfully", async () => {
            const res = await request(app)
                .put("/api/v1/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({ username: "updateduser", email: "updated@example.com" });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("Berhasil memperbarui data user");
        });

        test("should return 401 without token", async () => {
            const res = await request(app)
                .put("/api/v1/auth/profile")
                .send({ username: "updateduser", email: "updated@example.com" });

            expect(res.status).toBe(401);
        });

        test("should return 400 with short username", async () => {
            const res = await request(app)
                .put("/api/v1/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({ username: "ab", email: "updated@example.com" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });

        test("should return 400 with invalid email", async () => {
            const res = await request(app)
                .put("/api/v1/auth/profile")
                .set("Authorization", `Bearer ${token}`)
                .send({ username: "updateduser", email: "invalid-email" });

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });
    });

    describe("POST /auth/logout", () => {
        test("should logout successfully", async () => {
            await registerUser();
            const loginRes = await request(app)
                .post("/api/v1/auth/login")
                .send({ username: "testuser", password: "Test123!xyz" });
            const token = loginRes.body.data.token;

            const res = await request(app)
                .post("/api/v1/auth/logout")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("Logout Berhasil");
        });
    });
});
