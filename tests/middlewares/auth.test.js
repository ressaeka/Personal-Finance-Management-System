import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  verifyToken: jest.fn(),
}));

jest.unstable_mockModule("../../src/models/tokenBlacklist.js", () => ({
  isBlacklisted: jest.fn(),
}));

const { authenticate } = await import("../../src/middleware/auth.js");
const { verifyToken } = await import("../../src/utils/jwt.js");
const { isBlacklisted } = await import("../../src/models/tokenBlacklist.js");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
    isBlacklisted.mockResolvedValue(false);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe("Token Tidak Ditemukan", () => {
    test("should call next with 401 if no authorization header", async () => {
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe("Token wajib ada");
    });

    test("should call next with 401 if authorization header is empty", async () => {
      req.headers.authorization = "";

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe("Format Token Salah", () => {
    test("should call next with 401 if token doesn't start with Bearer", async () => {
      req.headers.authorization = "Token abc123";

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe("Format token salah. Gunakan: Bearer <token>");
    });

    test("should call next with 401 if only 'Bearer' without token", async () => {
      req.headers.authorization = "Bearer ";

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe("Token kosong");
    });

    test("should call next with 401 if token has no space after Bearer", async () => {
      req.headers.authorization = "Bearer";

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe("Format token salah. Gunakan: Bearer <token>");
    });
  });

  describe("JWT_SECRET Missing", () => {
    test("should call next with 500 if JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;
      req.headers.authorization = "Bearer valid_token";

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(500);
      expect(next.mock.calls[0][0].message).toBe("Konfigurasi server error");
    });
  });

  describe("Token Valid", () => {
    test("should call next and attach user to req if token is valid", async () => {
      req.headers.authorization = "Bearer valid_token";

      const mockDecoded = {
        id_user: 1,
        username: "testuser",
        email: "test@example.com",
        jti: "test-jti",
      };
      verifyToken.mockReturnValue(mockDecoded);

      await authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith("valid_token");
      expect(req.user).toBeDefined();
      expect(req.user.id_user).toBe(1);
      expect(req.user.username).toBe("testuser");
      expect(isBlacklisted).toHaveBeenCalledWith("test-jti");
      expect(next).toHaveBeenCalledWith();
    });

    test("should call next with 401 if token is blacklisted", async () => {
      req.headers.authorization = "Bearer blacklisted_token";

      const mockDecoded = {
        id_user: 1,
        username: "testuser",
        email: "test@example.com",
        jti: "blacklisted-jti",
      };
      verifyToken.mockReturnValue(mockDecoded);
      isBlacklisted.mockResolvedValue(true);

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe("Token sudah tidak valid");
    });
  });

  describe("Token Expired", () => {
    test("should call next with 401 if token is expired", async () => {
      req.headers.authorization = "Bearer expired_token";

      const expiredError = new Error("Token expired");
      expiredError.name = "TokenExpiredError";
      verifyToken.mockImplementation(() => {
        throw expiredError;
      });

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe("Token sudah kadaluarsa, silakan login ulang");
    });
  });

  describe("Token Invalid", () => {
    test("should call next with 401 if token is invalid", async () => {
      req.headers.authorization = "Bearer invalid_token";

      const invalidError = new Error("Invalid token");
      invalidError.name = "JsonWebTokenError";
      verifyToken.mockImplementation(() => {
        throw invalidError;
      });

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toBe("Token tidak valid");
    });
  });
});
