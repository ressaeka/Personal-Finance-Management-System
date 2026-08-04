import { app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

describe("Error handling", () => {
  it("should return 404 for unknown route with consistent shape", async () => {
    const res = await request.get("/api/v1/unknown-route");

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toContain("tidak ditemukan");
  });

  it("should return 400 for malformed JSON body", async () => {
    const res = await request
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send('{"username": "x", "password": }');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("failed");
  });

  it("should return 413 for body larger than 10kb", async () => {
    const bigBody = { username: "x".repeat(12000), password: "y".repeat(12000) };
    const res = await request.post("/api/v1/auth/register").send(bigBody);

    expect(res.status).toBe(413);
  });

  it("should return 401 for protected route without token", async () => {
    const res = await request.get("/api/v1/transaksi");

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toBe("Token wajib ada");
  });

  it("should return 401 for malformed Authorization header", async () => {
    const res = await request.get("/api/v1/transaksi").set("Authorization", "Basic abc123");

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Bearer");
  });

  it("should return 401 for invalid token", async () => {
    const res = await request
      .get("/api/v1/transaksi")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token tidak valid");
  });
});
