import { prisma, app } from "./helpers/setup.js";
import supertest from "supertest";
import jwt from "jsonwebtoken";

const request = supertest(app);

const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || process.env.JWT_SECRET;

const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "Test123!",
};

const secondUser = {
  username: "otheruser",
  email: "other@example.com",
  password: "Test123!",
};

const generateResetToken = (payload) =>
  jwt.sign(payload, JWT_RESET_SECRET, { expiresIn: "15m" });

describe("POST /api/v1/auth/register", () => {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should register a new user", async () => {
    const res = await request.post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.username).toBe("testuser");
    expect(res.body.data.email).toBe("test@example.com");
    expect(res.body.data.password).toBeUndefined();
  });

  it("should reject duplicate email", async () => {
    await request.post("/api/v1/auth/register").send(testUser);

    const res = await request
      .post("/api/v1/auth/register")
      .send({ ...testUser, username: "other" });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Email");
  });

  it("should reject duplicate username", async () => {
    await request.post("/api/v1/auth/register").send(testUser);

    const res = await request
      .post("/api/v1/auth/register")
      .send({ ...testUser, email: "other@example.com" });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Username");
  });

  it("should reject weak password", async () => {
    const res = await request
      .post("/api/v1/auth/register")
      .send({ ...testUser, password: "12345678" });

    expect(res.status).toBe(400);
  });

  it("should reject short username", async () => {
    const res = await request
      .post("/api/v1/auth/register")
      .send({ ...testUser, username: "ab" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await request.post("/api/v1/auth/register").send(testUser);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should login with correct credentials", async () => {
    const res = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.username).toBe("testuser");
  });

  it("should reject wrong password", async () => {
    const res = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: "WrongPass1!",
    });

    expect(res.status).toBe(401);
  });

  it("should reject non-existent user", async () => {
    const res = await request.post("/api/v1/auth/login").send({
      username: "nobody",
      password: testUser.password,
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/auth/profile", () => {
  let token;

  beforeEach(async () => {
    const res = await request.post("/api/v1/auth/register").send(testUser);
    const login = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    token = login.body.data.accessToken;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should return profile when authenticated", async () => {
    const res = await request
      .get("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("testuser");
  });

  it("should reject without token", async () => {
    const res = await request.get("/api/v1/auth/profile");

    expect(res.status).toBe(401);
  });

  it("should reject invalid token", async () => {
    const res = await request
      .get("/api/v1/auth/profile")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/v1/auth/profile", () => {
  let token;

  beforeEach(async () => {
    await request.post("/api/v1/auth/register").send(testUser);
    const login = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    token = login.body.data.accessToken;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should update username", async () => {
    const res = await request
      .put("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "newuser" });

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("newuser");
  });

  it("should reject duplicate email", async () => {
    await request.post("/api/v1/auth/register").send({
      username: "other",
      email: "other@example.com",
      password: "Test123!",
    });

    const res = await request
      .put("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "other@example.com" });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/v1/auth/logout", () => {
  let token;
  let refreshToken;

  beforeEach(async () => {
    await request.post("/api/v1/auth/register").send(testUser);
    const login = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    token = login.body.data.accessToken;
    refreshToken = login.body.data.refreshToken;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should logout successfully", async () => {
    const res = await request
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/auth/refresh", () => {
  let refreshToken;

  beforeEach(async () => {
    await request.post("/api/v1/auth/register").send(testUser);
    const login = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    refreshToken = login.body.data.refreshToken;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should return new tokens", async () => {
    const res = await request
      .post("/api/v1/auth/refresh")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("should reject invalid refresh token", async () => {
    const res = await request
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: "invalidtoken" });

    expect(res.status).toBe(401);
  });

  it("should reject empty body", async () => {
    const res = await request
      .post("/api/v1/auth/refresh")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/forgot-password", () => {
  let token;

  beforeEach(async () => {
    await request.post("/api/v1/auth/register").send(testUser);
    const login = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    token = login.body.data.accessToken;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should accept valid email and return success", async () => {
    const res = await request
      .post("/api/v1/auth/forgot-password")
      .send({ email: testUser.email });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return success for non-existent email (no enumeration)", async () => {
    const res = await request
      .post("/api/v1/auth/forgot-password")
      .send({ email: "nonexistent@test.com" });

    expect(res.status).toBe(200);
  });

  it("should reject invalid email format", async () => {
    const res = await request
      .post("/api/v1/auth/forgot-password")
      .send({ email: "notanemail" });

    expect(res.status).toBe(400);
  });

  it("should reject empty body", async () => {
    const res = await request
      .post("/api/v1/auth/forgot-password")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/reset-password", () => {
  let userId;

  beforeEach(async () => {
    const reg = await request.post("/api/v1/auth/register").send(testUser);
    userId = reg.body.data.id;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should reset password with valid token", async () => {
    const token = generateResetToken({
      id: userId,
      email: testUser.email,
    });

    const res = await request
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "NewPass123!" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should allow login with new password after reset", async () => {
    const token = generateResetToken({
      id: userId,
      email: testUser.email,
    });

    await request
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "NewPass123!" });

    const loginRes = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: "NewPass123!",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
  });

  it("should reject login with old password after reset", async () => {
    const token = generateResetToken({
      id: userId,
      email: testUser.email,
    });

    await request
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "NewPass123!" });

    const loginRes = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(loginRes.status).toBe(401);
  });

  it("should reject invalid token", async () => {
    const res = await request
      .post("/api/v1/auth/reset-password")
      .send({ token: "invalidtoken", password: "NewPass123!" });

    expect(res.status).toBe(401);
  });

  it("should reject weak password", async () => {
    const token = generateResetToken({
      id: userId,
      email: testUser.email,
    });

    const res = await request
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "12345678" });

    expect(res.status).toBe(400);
  });

  it("should reject empty body", async () => {
    const res = await request
      .post("/api/v1/auth/reset-password")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("Profile password change revokes sessions", () => {
  let token;
  let refreshToken;

  beforeEach(async () => {
    await request.post("/api/v1/auth/register").send(testUser);
    const login = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    token = login.body.data.accessToken;
    refreshToken = login.body.data.refreshToken;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should allow login with new password after profile password change", async () => {
    await request
      .put("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "NewPass123!" });

    const loginRes = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: "NewPass123!",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
  });

  it("should reject login with old password after profile password change", async () => {
    await request
      .put("/api/v1/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "NewPass123!" });

    const loginRes = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(loginRes.status).toBe(401);
  });
});
