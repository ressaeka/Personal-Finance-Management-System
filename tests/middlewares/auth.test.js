import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  verifyToken: jest.fn()
}));

const { authenticate } = await import("../../src/middleware/auth.js");
const { verifyToken } = await import("../../src/utils/jwt.js");

describe("Auth Middleware", () => {
    let req, res, next;
    
    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();

        jest.clearAllMocks();

        process.env.JWT_SECRET = "test_secret";
    });
    
    afterEach(() => {
        delete process.env.JWT_SECRET;
    });
    
    describe("Token Tidak Ditemukan", () => {
        test("should return 401 if no authorization header", () => {
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Token wajib ada");
        });
        
        test("should return 401 if authorization header is empty", () => {
            req.headers.authorization = "";
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Token wajib ada");
        });
    });
    
    describe("Format Token Salah", () => {
        test("should return 401 if token doesn't start with Bearer", () => {
            req.headers.authorization = "Token abc123";
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Format token salah. Gunakan: Bearer <token>");
        });
        
        test("should return 401 if only 'Bearer' without token", () => {
            req.headers.authorization = "Bearer ";
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Token kosong");
        });
        
        test("should return 401 if token has no space after Bearer", () => {
            req.headers.authorization = "Bearer";
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Format token salah. Gunakan: Bearer <token>");
        });
    });
    
    describe("JWT_SECRET Missing", () => {
        test("should return 500 if JWT_SECRET is not set", () => {
            delete process.env.JWT_SECRET;
            req.headers.authorization = "Bearer valid_token";
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(500);
            expect(err.message).toBe("Internal Server Error");
        });
    });
    
    describe("Token Valid", () => {
        test("should call next and attach user to req if token is valid", () => {
            req.headers.authorization = "Bearer valid_token";
            
            const mockDecoded = {
                id_user: 1,
                username: "testuser",
                email: "test@example.com"
            };
            verifyToken.mockReturnValue(mockDecoded);
            
            authenticate(req, res, next);
            
            expect(verifyToken).toHaveBeenCalledWith("valid_token");
            expect(req.user).toBeDefined();
            expect(req.user.id_user).toBe(1);
            expect(req.user.username).toBe("testuser");
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });
    
    describe("Token Expired", () => {
        test("should return 401 if token is expired", () => {
            req.headers.authorization = "Bearer expired_token";
            
            const expiredError = new Error("Token expired");
            expiredError.name = "TokenExpiredError";
            verifyToken.mockImplementation(() => {
                throw expiredError;
            });
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Token sudah kadaluarsa, silakan login ulang");
        });
    });
    
    describe("Token Invalid", () => {
        test("should return 401 if token is invalid", () => {
            req.headers.authorization = "Bearer invalid_token";
            
            const invalidError = new Error("Invalid token");
            invalidError.name = "JsonWebTokenError";
            verifyToken.mockImplementation(() => {
                throw invalidError;
            });
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Token tidak valid");
        });
        
        test("should return 401 for any other JWT error", () => {
            req.headers.authorization = "Bearer malformed_token";
            
            const malformedError = new Error("Malformed token");
            malformedError.name = "JsonWebTokenError";
            verifyToken.mockImplementation(() => {
                throw malformedError;
            });
            
            authenticate(req, res, next);
            
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe("Token tidak valid");
        });
    });
});
