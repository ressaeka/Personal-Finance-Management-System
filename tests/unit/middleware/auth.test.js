import { jest } from "@jest/globals";
jest.unstable_mockModule("../../../src/utils/jwt.js", () => ({
  verifyToken: jest.fn(),
}));

const { authenticate } = await import("../../../src/middleware/auth.js");

const jwtModule = await import("../../../src/utils/jwt.js");

const createReq = (authorization) => ({ headers: { authorization } });
const createRes = () => ({});
const createNext = () => jest.fn();

describe("authenticate middleware", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should reject missing Authorization header", () => {
    const next = createNext();

    authenticate(createReq(undefined), createRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: "Token wajib ada" }),
    );
  });

  it("should reject non-Bearer format", () => {
    const next = createNext();

    authenticate(createReq("Basic abc123"), createRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(next.mock.calls[0][0].message).toContain("Bearer");
  });

  it("should reject empty token", () => {
    const next = createNext();

    authenticate(createReq("Bearer "), createRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: "Token kosong" }),
    );
  });

  it("should set req.user and call next for valid token", () => {
    const next = createNext();
    jwtModule.verifyToken.mockReturnValue({ id: 1, username: "testuser" });

    const req = createReq("Bearer valid.token.here");
    authenticate(req, createRes(), next);

    expect(req.user).toEqual({ id: 1, username: "testuser" });
    expect(next).toHaveBeenCalledWith();
  });

  it("should map expired token to 401 message", () => {
    const next = createNext();
    const error = new Error("jwt expired");
    error.name = "TokenExpiredError";
    jwtModule.verifyToken.mockImplementation(() => {
      throw error;
    });

    authenticate(createReq("Bearer expired.token"), createRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(next.mock.calls[0][0].message).toContain("kadaluarsa");
  });

  it("should map malformed token to 401 message", () => {
    const next = createNext();
    const error = new Error("invalid signature");
    error.name = "JsonWebTokenError";
    jwtModule.verifyToken.mockImplementation(() => {
      throw error;
    });

    authenticate(createReq("Bearer bad.token"), createRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: "Token tidak valid" }),
    );
  });
});
