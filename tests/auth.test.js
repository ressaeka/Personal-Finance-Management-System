import { prisma, app } from "./helpers/setup.js";
import supertest from "supertest";

const request = supertest(app);

const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "Test123!",
};

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
    expect(res.body.data.token).toBeDefined();
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
    token = login.body.data.token;
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
    token = login.body.data.token;
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

  beforeEach(async () => {
    await request.post("/api/v1/auth/register").send(testUser);
    const login = await request.post("/api/v1/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });
    token = login.body.data.token;
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should return logout instruction", async () => {
    const res = await request
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.instruction).toBeDefined();
  });
});
