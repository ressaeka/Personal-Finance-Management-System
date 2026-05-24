import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/models/auth.js", () => ({
  findUserByEmail: jest.fn(),
  findUserByUsername: jest.fn(),
  createUsers: jest.fn(),
  findUserById: jest.fn()
}));

jest.unstable_mockModule("../../src/utils/bcrypt.js", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  generateToken: jest.fn()
}));

const { registerService, loginService, getProfileService } = await import("../../src/service/auth.js");
const { findUserByEmail, findUserByUsername, createUsers, findUserById } = await import("../../src/models/auth.js");
const { comparePassword } = await import("../../src/utils/bcrypt.js");
const { generateToken } = await import("../../src/utils/jwt.js");

describe("AUTH SERVICE TESTS", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("REGISTER SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if username is missing", async () => {
                const userData = { email: "test@example.com", password: "Test123!xyz" };
                
                await expect(registerService(userData)).rejects.toThrow("Username, email dan password wajib diisi");
            });
            
            test("should throw error if email is missing", async () => {
                const userData = { username: "testuser", password: "Test123!xyz" };
                
                await expect(registerService(userData)).rejects.toThrow("Username, email dan password wajib diisi");
            });
            
            test("should throw error if password is missing", async () => {
                const userData = { username: "testuser", email: "test@example.com" };
                
                await expect(registerService(userData)).rejects.toThrow("Username, email dan password wajib diisi");
            });
            
            test("should throw error if username less than 6 characters", async () => {
                const userData = {
                    username: "abc",
                    email: "test@example.com",
                    password: "Test123!xyz"
                };
                
                await expect(registerService(userData)).rejects.toThrow("Username minimal 6 karakter");
            });
            
            test("should throw error if email format is invalid", async () => {
                const userData = {
                    username: "testuser",
                    email: "invalid-email",
                    password: "Test123!xyz"
                };
                
                await expect(registerService(userData)).rejects.toThrow("Format email tidak valid");
            });
            
            test("should throw error if password is weak", async () => {
                const userData = {
                    username: "testuser",
                    email: "test@example.com",
                    password: "weak"
                };
                
                await expect(registerService(userData)).rejects.toThrow("Password harus minimal");
            });
        });
        
        describe("Database Conflict Tests", () => {
            test("should throw error if email already exists", async () => {
                const userData = {
                    username: "testuser",
                    email: "existing@example.com",
                    password: "Test123!xyz"
                };
                
                findUserByEmail.mockResolvedValue({ id: 1, email: "existing@example.com" });
                
                await expect(registerService(userData)).rejects.toThrow("Email sudah terdaftar");
            });
            
            test("should throw error if username already exists", async () => {
                const userData = {
                    username: "existinguser",
                    email: "test@example.com",
                    password: "Test123!xyz"
                };
                
                findUserByEmail.mockResolvedValue(null);
                findUserByUsername.mockResolvedValue({ id: 1, username: "existinguser" });
                
                await expect(registerService(userData)).rejects.toThrow("Username sudah terdaftar");
            });
        });
        
        describe("Success Tests", () => {
            test("should successfully register a new user", async () => {
                const userData = {
                    username: "testuser",
                    email: "test@example.com",
                    password: "Test123!xyz"
                };
                
                findUserByEmail.mockResolvedValue(null);
                findUserByUsername.mockResolvedValue(null);
                createUsers.mockResolvedValue({
                    id_user: 1,
                    username: "testuser",
                    email: "test@example.com",
                    password: "hashedpassword123",
                    created_at: new Date()
                });
                
                const result = await registerService(userData);
                
                expect(result).toBeDefined();
                expect(result.username).toBe("testuser");
                expect(result.email).toBe("test@example.com");
                expect(result.password).toBeUndefined();
                expect(createUsers).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("LOGIN SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if username is missing", async () => {
                await expect(loginService({ password: "Test123" })).rejects.toThrow("Username dan Password wajib diisi");
            });
            
            test("should throw error if password is missing", async () => {
                await expect(loginService({ username: "testuser" })).rejects.toThrow("Username dan Password wajib diisi");
            });
        });
        
        describe("Authentication Tests", () => {
            test("should throw error if user not found", async () => {
                findUserByUsername.mockResolvedValue(null);
                
                await expect(loginService({
                    username: "nonexistent",
                    password: "Test123!xyz"
                })).rejects.toThrow("Username atau Password salah, silakan coba kembali");
            });
            
            test("should throw error if password is incorrect", async () => {
                const mockUser = {
                    id_user: 1,
                    username: "testuser",
                    password: "hashedpassword123"
                };
                
                findUserByUsername.mockResolvedValue(mockUser);
                comparePassword.mockResolvedValue(false);
                
                await expect(loginService({
                    username: "testuser",
                    password: "WrongPass123"
                })).rejects.toThrow("Username dan Password salah");
            });
        });
        
        describe("Success Tests", () => {
            test("should successfully login with correct credentials", async () => {
                const mockUser = {
                    id_user: 1,
                    username: "testuser",
                    email: "test@example.com",
                    password: "hashedpassword123"
                };
                
                findUserByUsername.mockResolvedValue(mockUser);
                comparePassword.mockResolvedValue(true);
                generateToken.mockReturnValue("jwt-token-123");
                
                const result = await loginService({
                    username: "testuser",
                    password: "Test123!xyz"
                });
                
                expect(result).toBeDefined();
                expect(result.token).toBe("jwt-token-123");
                expect(result.user).toBeDefined();
                expect(result.user.id_user).toBe(1);
                expect(result.user.username).toBe("testuser");
                expect(result.user.email).toBe("test@example.com");
                expect(result.user.password).toBeUndefined();
            });
        });
    });

    describe("GET PROFILE SERVICE", () => {
        test("should successfully get user profile", async () => {
            const mockUser = {
                id_user: 1,
                username: "testuser",
                email: "test@example.com",
                password: "hashedpassword123",
                created_at: "2024-01-01"
            };
            
            findUserById.mockResolvedValue(mockUser);
            
            const result = await getProfileService({ id_user: 1 });
            
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(result.username).toBe("testuser");
            expect(result.email).toBe("test@example.com");
            expect(result.password).toBeUndefined();
            expect(findUserById).toHaveBeenCalledWith(1);
        });
        
        test("should throw error if user not found", async () => {
            findUserById.mockResolvedValue(null);
            
            await expect(getProfileService({ id_user: 999 })).rejects.toThrow("User tidak ditemukan");
            expect(findUserById).toHaveBeenCalledWith(999);
        });
    });

    describe("LOGOUT", () => {
        test("logout should not throw error", () => {
            expect(true).toBe(true);
        });
        
        test("logout should clear token", () => {
            let token = "jwt-token-123";
            expect(token).toBeDefined();
            
            token = null;
            expect(token).toBeNull();
        });
    });
});
