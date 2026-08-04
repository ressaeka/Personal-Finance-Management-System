import { jest } from "@jest/globals";
jest.unstable_mockModule("../../../src/repositories/auth.js", () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  findUserByUsername: jest.fn(),
  updateUserById: jest.fn(),
}));

jest.unstable_mockModule("../../../src/services/refreshToken.js", () => ({
  setRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
}));

jest.unstable_mockModule("../../../src/config/mailer.js", () => ({
  default: { sendMail: jest.fn() },
}));

jest.unstable_mockModule("../../../src/utils/bcrypt.js", () => ({
  hashPassword: jest.fn(async (password) => `hashed:${password}`),
  comparePassword: jest.fn(async (plain, hashed) => plain === hashed.replace("hashed:", "")),
}));

const {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  getProfileService,
  updateProfileService,
  forgotPasswordService,
  resetPasswordService,
} = await import("../../../src/services/auth.js");

const repo = await import("../../../src/repositories/auth.js");
const refreshTokenModule = await import("../../../src/services/refreshToken.js");
const mailer = await import("../../../src/config/mailer.js");

const user = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  password: "hashed:Test123!",
  createdAt: new Date("2026-07-01"),
};

describe("registerService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should register a new user and strip password", async () => {
    repo.findUserByEmail.mockResolvedValue(null);
    repo.findUserByUsername.mockResolvedValue(null);
    repo.createUser.mockResolvedValue(user);

    const result = await registerService({
      username: "testuser",
      email: "test@example.com",
      password: "Test123!",
    });

    expect(repo.createUser).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      password: "hashed:Test123!",
    });
    expect(result.password).toBeUndefined();
    expect(result.email).toBe("test@example.com");
  });

  it("should reject duplicate email", async () => {
    repo.findUserByEmail.mockResolvedValue(user);

    await expect(
      registerService({ username: "new", email: "test@example.com", password: "Test123!" })
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("Email") });
    expect(repo.createUser).not.toHaveBeenCalled();
  });

  it("should reject duplicate username", async () => {
    repo.findUserByEmail.mockResolvedValue(null);
    repo.findUserByUsername.mockResolvedValue(user);

    await expect(
      registerService({ username: "testuser", email: "other@example.com", password: "Test123!" })
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining("Username") });
  });
});

describe("loginService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should login and store refresh token", async () => {
    repo.findUserByUsername.mockResolvedValue(user);
    refreshTokenModule.setRefreshToken.mockResolvedValue(undefined);

    const result = await loginService({ username: "testuser", password: "Test123!" });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe(1);
    expect(refreshTokenModule.setRefreshToken).toHaveBeenCalledWith(1, result.refreshToken);
  });

  it("should reject non-existent user", async () => {
    repo.findUserByUsername.mockResolvedValue(null);

    await expect(loginService({ username: "nobody", password: "Test123!" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("should reject wrong password", async () => {
    repo.findUserByUsername.mockResolvedValue(user);

    await expect(loginService({ username: "testuser", password: "WrongPass1!" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe("refreshTokenService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should rotate tokens on valid refresh", async () => {
    const validToken = (await import("jsonwebtoken")).default.sign(
      { id: 1, username: "testuser", email: "test@example.com" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    refreshTokenModule.getRefreshToken.mockResolvedValue("1");
    refreshTokenModule.deleteRefreshToken.mockResolvedValue(undefined);
    refreshTokenModule.setRefreshToken.mockResolvedValue(undefined);

    const result = await refreshTokenService(validToken);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(refreshTokenModule.deleteRefreshToken).toHaveBeenCalledWith(validToken);
    expect(refreshTokenModule.setRefreshToken).toHaveBeenCalledWith(1, result.refreshToken);
  });

  it("should reject invalid token", async () => {
    await expect(refreshTokenService("invalid-token")).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should reject token not stored for the user", async () => {
    const validToken = (await import("jsonwebtoken")).default.sign(
      { id: 1, username: "testuser", email: "test@example.com" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    refreshTokenModule.getRefreshToken.mockResolvedValue("999");

    await expect(refreshTokenService(validToken)).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("logoutService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should delete refresh token when provided", async () => {
    refreshTokenModule.deleteRefreshToken.mockResolvedValue(undefined);

    await logoutService(1, "some-token");

    expect(refreshTokenModule.deleteRefreshToken).toHaveBeenCalledWith("some-token");
  });

  it("should do nothing when no token", async () => {
    await logoutService(1, undefined);

    expect(refreshTokenModule.deleteRefreshToken).not.toHaveBeenCalled();
  });
});

describe("getProfileService", () => {
  it("should return profile without password", async () => {
    repo.findUserById.mockResolvedValue(user);

    const result = await getProfileService(1);

    expect(result.username).toBe("testuser");
    expect(result.password).toBeUndefined();
  });

  it("should throw 404 when user not found", async () => {
    repo.findUserById.mockResolvedValue(null);

    await expect(getProfileService(999)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateProfileService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should update username and email", async () => {
    repo.findUserById.mockResolvedValue(user);
    repo.findUserByEmail.mockResolvedValue(null);
    repo.findUserByUsername.mockResolvedValue(null);
    repo.updateUserById.mockResolvedValue({ ...user, username: "newuser", email: "new@example.com" });

    const result = await updateProfileService(1, {
      username: "newuser",
      email: "new@example.com",
    });

    expect(repo.updateUserById).toHaveBeenCalledWith(1, {
      username: "newuser",
      email: "new@example.com",
    });
    expect(refreshTokenModule.revokeAllUserTokens).not.toHaveBeenCalled();
    expect(result.password).toBeUndefined();
  });

  it("should revoke all sessions when password changed", async () => {
    repo.findUserById.mockResolvedValue(user);
    repo.updateUserById.mockResolvedValue({ ...user, password: "hashed:NewPass123!" });

    await updateProfileService(1, { password: "NewPass123!" });

    expect(repo.updateUserById).toHaveBeenCalledWith(1, { password: "hashed:NewPass123!" });
    expect(refreshTokenModule.revokeAllUserTokens).toHaveBeenCalledWith(1);
  });

  it("should reject email owned by another user", async () => {
    repo.findUserById.mockResolvedValue(user);
    repo.findUserByEmail.mockResolvedValue({ ...user, id: 2 });

    await expect(updateProfileService(1, { email: "taken@example.com" })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining("Email"),
    });
  });

  it("should reject username owned by another user", async () => {
    repo.findUserById.mockResolvedValue(user);
    repo.findUserByEmail.mockResolvedValue(null);
    repo.findUserByUsername.mockResolvedValue({ ...user, id: 2 });

    await expect(updateProfileService(1, { username: "taken" })).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining("Username"),
    });
  });

  it("should throw 404 when user not found", async () => {
    repo.findUserById.mockResolvedValue(null);

    await expect(updateProfileService(999, { username: "x" })).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("forgotPasswordService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should silently succeed for unknown email (anti-enumeration)", async () => {
    repo.findUserByEmail.mockResolvedValue(null);

    const result = await forgotPasswordService("unknown@example.com");

    expect(result).toBeUndefined();
    expect(mailer.default.sendMail).not.toHaveBeenCalled();
  });

  it("should send reset email for known user", async () => {
    repo.findUserByEmail.mockResolvedValue(user);
    mailer.default.sendMail.mockResolvedValue({ messageId: "1" });

    await forgotPasswordService("test@example.com");

    expect(mailer.default.sendMail).toHaveBeenCalledTimes(1);
    const mail = mailer.default.sendMail.mock.calls[0][0];
    expect(mail.to).toBe("test@example.com");
    expect(mail.html).toContain("/reset-password?token=");
  });

  it("should not crash when email sending fails", async () => {
    repo.findUserByEmail.mockResolvedValue(user);
    mailer.default.sendMail.mockRejectedValue(new Error("SMTP down"));

    await expect(forgotPasswordService("test@example.com")).resolves.toBeUndefined();
  });
});

describe("resetPasswordService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should reset password and revoke sessions", async () => {
    const resetToken = (await import("jsonwebtoken")).default.sign(
      { id: 1, email: "test@example.com" },
      process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    repo.findUserById.mockResolvedValue(user);
    repo.updateUserById.mockResolvedValue(user);
    refreshTokenModule.revokeAllUserTokens.mockResolvedValue(undefined);

    await resetPasswordService(resetToken, "NewPass123!");

    expect(repo.updateUserById).toHaveBeenCalledWith(1, { password: "hashed:NewPass123!" });
    expect(refreshTokenModule.revokeAllUserTokens).toHaveBeenCalledWith(1);
  });

  it("should reject invalid token", async () => {
    await expect(resetPasswordService("bad-token", "NewPass123!")).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("should reject when user no longer exists", async () => {
    const resetToken = (await import("jsonwebtoken")).default.sign(
      { id: 999, email: "test@example.com" },
      process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    repo.findUserById.mockResolvedValue(null);

    await expect(resetPasswordService(resetToken, "NewPass123!")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
