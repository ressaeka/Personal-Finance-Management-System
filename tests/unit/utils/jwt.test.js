import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
  generateToken,
} from "../../../src/utils/jwt.js";

const payload = { id: 1, username: "testuser", email: "test@example.com" };

describe("jwt utils", () => {
  it("generateToken is backward-compatible alias of generateAccessToken", () => {
    expect(generateToken).toBe(generateAccessToken);
  });

  describe("access token", () => {
    it("should generate and verify access token", () => {
      const token = generateAccessToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(1);
      expect(decoded.username).toBe("testuser");
    });

    it("should reject malformed token", () => {
      expect(() => verifyToken("not-a-jwt")).toThrow(jwt.JsonWebTokenError);
    });

    it("should throw TokenExpiredError for expired token", () => {
      const expired = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "-1s" });

      expect(() => verifyToken(expired)).toThrow(jwt.TokenExpiredError);
    });
  });

  describe("refresh token", () => {
    it("should generate and verify refresh token", () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.id).toBe(1);
    });

    it("should reject token signed with different secret", () => {
      const foreignToken = jwt.sign(payload, "totally-different-secret", { expiresIn: "7d" });

      expect(() => verifyRefreshToken(foreignToken)).toThrow(jwt.JsonWebTokenError);
    });

    it("should throw TokenExpiredError for expired refresh token", () => {
      const expired = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: "-1s",
      });

      expect(() => verifyRefreshToken(expired)).toThrow(jwt.TokenExpiredError);
    });
  });

  describe("reset token", () => {
    it("should generate and verify reset token", () => {
      const token = generateResetToken({ id: 1, email: "test@example.com" });
      const decoded = verifyResetToken(token);

      expect(decoded.id).toBe(1);
    });

    it("should reject invalid reset token", () => {
      expect(() => verifyResetToken("invalid")).toThrow();
    });
  });
});
