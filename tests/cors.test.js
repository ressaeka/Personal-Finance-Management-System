process.env.CORS_ORIGINS = "http://localhost:5173,http://localhost:3000";

const { app } = await import("./helpers/setup.js");
const supertest = await import("supertest");

const request = supertest.default(app);

describe("CORS middleware", () => {
  it("should allow requests without Origin header (non-browser)", async () => {
    const res = await request.get("/health");

    expect(res.status).toBe(200);
  });

  it("should allow whitelisted origin and reflect it", async () => {
    const res = await request
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("should reject disallowed origin with 403", async () => {
    const res = await request
      .get("/health")
      .set("Origin", "https://evil.com");

    expect(res.status).toBe(403);
    expect(res.body.status).toBe("failed");
    expect(res.body.message).toContain("Origin");
  });

  it("should reject preflight OPTIONS from disallowed origin", async () => {
    const res = await request
      .options("/api/v1/auth/login")
      .set("Origin", "https://evil.com")
      .set("Access-Control-Request-Method", "POST");

    expect(res.status).toBe(403);
  });

  it("should answer preflight from allowed origin", async () => {
    const res = await request
      .options("/api/v1/auth/login")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type, Authorization");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-methods"]).toContain("POST");
  });
});
