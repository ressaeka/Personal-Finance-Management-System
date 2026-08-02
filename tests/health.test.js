import { app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

describe("GET /health", () => {
  it("should return 200 with ok status", async () => {
    const res = await request.get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("should report database as up", async () => {
    const res = await request.get("/health");

    expect(res.body.checks.database).toBe("up");
  });

  it("should have valid response shape", async () => {
    const res = await request.get("/health");

    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("checks");
    expect(res.body).toHaveProperty("timestamp");
    expect(Date.parse(res.body.timestamp)).not.toBeNaN();
    expect(res.body.checks).toHaveProperty("database");
    expect(res.body.checks).toHaveProperty("redis");
  });
});
