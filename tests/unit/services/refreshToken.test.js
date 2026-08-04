import { jest } from "@jest/globals";
jest.unstable_mockModule("../../../src/utils/jwt.js", () => ({
  verifyRefreshToken: jest.fn(),
}));

jest.unstable_mockModule("../../../src/config/redis.js", () => ({
  default: undefined,
  disconnectRedis: jest.fn(),
}));

const {
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  revokeAllUserTokens,
} = await import("../../../src/services/refreshToken.js");

const jwtModule = await import("../../../src/utils/jwt.js");

describe("refreshToken service (test mode — Redis bypass)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("setRefreshToken is a no-op in test mode", async () => {
    await expect(setRefreshToken(1, "token")).resolves.toBeUndefined();
  });

  it("getRefreshToken decodes valid token to userId", async () => {
    jwtModule.verifyRefreshToken.mockReturnValue({ id: 42 });

    const result = await getRefreshToken("valid-token");

    expect(result).toBe("42");
  });

  it("getRefreshToken returns null for invalid token", async () => {
    jwtModule.verifyRefreshToken.mockImplementation(() => {
      throw new Error("invalid");
    });

    const result = await getRefreshToken("invalid-token");

    expect(result).toBeNull();
  });

  it("deleteRefreshToken is a no-op in test mode", async () => {
    await expect(deleteRefreshToken("token")).resolves.toBeUndefined();
  });

  it("revokeAllUserTokens is a no-op in test mode", async () => {
    await expect(revokeAllUserTokens(1)).resolves.toBeUndefined();
  });
});
