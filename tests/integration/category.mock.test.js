import { jest } from "@jest/globals";
import request from "supertest";

process.env.JWT_SECRET = "test_secret";
process.env.NODE_ENV = "test";

jest.unstable_mockModule("../../src/config/database.js", () => ({
  default: {
    query: jest.fn().mockResolvedValue({ rows: [] })
  }
}));

jest.unstable_mockModule("../../src/models/category.js", () => ({
  createCategory: jest.fn(),
  getAllCategory: jest.fn()
}));

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn()
}));

const app = (await import("../../src/app.js")).default;
const { createCategory, getAllCategory } = await import("../../src/models/category.js");
const { verifyToken } = await import("../../src/utils/jwt.js");

describe("Category API (Mocked)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const validToken = "Bearer valid_token";

    describe("POST /api/v1/category", () => {
        test("should return 201 when category is created", async () => {
            verifyToken.mockReturnValue({ id_user: 1, username: "testuser" });
            createCategory.mockResolvedValue({
                id_category: 1, id_user: 1, nama_category: "Makanan", tipe: "pengeluaran"
            });

            const res = await request(app)
                .post("/api/v1/category")
                .set("Authorization", validToken)
                .send({ nama_category: "Makanan", tipe: "pengeluaran" });

            expect(res.status).toBe(201);
        });
    });

    describe("GET /api/v1/category", () => {
        test("should return all categories", async () => {
            verifyToken.mockReturnValue({ id_user: 1, username: "testuser" });
            getAllCategory.mockResolvedValue([
                { id_category: 1, id_user: 1, nama_category: "Makanan", tipe: "pengeluaran" },
                { id_category: 2, id_user: 1, nama_category: "Gaji", tipe: "pemasukan" }
            ]);

            const res = await request(app)
                .get("/api/v1/category")
                .set("Authorization", validToken);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe("Success");
            expect(res.body.data.category).toHaveLength(2);
        });

        test("should return empty array when no categories", async () => {
            verifyToken.mockReturnValue({ id_user: 1, username: "testuser" });
            getAllCategory.mockResolvedValue([]);

            const res = await request(app)
                .get("/api/v1/category")
                .set("Authorization", validToken);

            expect(res.status).toBe(200);
            expect(res.body.data.category).toHaveLength(0);
        });

        test("should return 401 without token", async () => {
            const res = await request(app).get("/api/v1/category");

            expect(res.status).toBe(401);
        });

        test("should handle database error", async () => {
            verifyToken.mockReturnValue({ id_user: 1, username: "testuser" });
            getAllCategory.mockRejectedValue(new Error("Database error"));

            const res = await request(app)
                .get("/api/v1/category")
                .set("Authorization", validToken);

            expect(res.status).toBe(400);
            expect(res.body.status).toBe("failed");
        });
    });
});
