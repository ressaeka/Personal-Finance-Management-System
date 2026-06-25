import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/models/auth.js", () => ({
  findUserByEmail: jest.fn(),
  findUserByUsername: jest.fn(),
  createUsers: jest.fn(),
  findUserById: jest.fn(),
  updateUserById: jest.fn()
}));

jest.unstable_mockModule("../../src/utils/bcrypt.js", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

jest.unstable_mockModule("../../src/utils/jwt.js", () => ({
  generateToken: jest.fn()
}));

const { registerService, loginService, getProfileService, updateUserByIdService } = await import("../../src/service/auth.js");
const { findUserByEmail, findUserByUsername, createUsers, findUserById, updateUserById } = await import("../../src/models/auth.js");
const { hashPassword, comparePassword } = await import("../../src/utils/bcrypt.js");
const { generateToken } = await import("../../src/utils/jwt.js");

describe("AUTH SERVICE TESTS", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("REGISTER SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if username is missing", async () => {
                const userData = { email: "test@example.com", password: "Test123!xyz" };
                
                await expect(registerService(userData)).rejects.toThrow("Username harus diisi dan minimal 3 karakter");
            });
            
            test("should throw error if email is missing", async () => {
                const userData = { username: "testuser", password: "Test123!xyz" };
                
                await expect(registerService(userData)).rejects.toThrow("Format email tidak valid");
            });
            
            test("should throw error if password is missing", async () => {
                const userData = { username: "testuser", email: "test@example.com" };
                
                await expect(registerService(userData)).rejects.toThrow("Password wajib diisi");
            });
            
            test("should throw error if username less than 3 characters", async () => {
                const userData = {
                    username: "ab",
                    email: "test@example.com",
                    password: "Test123!xyz"
                };
                
                await expect(registerService(userData)).rejects.toThrow("Username harus diisi dan minimal 3 karakter");
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
                
                await expect(registerService(userData)).rejects.toThrow("Password minimal 8 karakter");
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
                await expect(loginService({ password: "Test123" })).rejects.toThrow("Username wajib diisi");
            });
            
            test("should throw error if password is missing", async () => {
                await expect(loginService({ username: "testuser" })).rejects.toThrow("Password wajib diisi");
            });
        });
        
        describe("Authentication Tests", () => {
            test("should throw error if user not found", async () => {
                findUserByUsername.mockResolvedValue(null);
                
                await expect(loginService({
                    username: "nonexistent",
                    password: "Test123!xyz"
                })).rejects.toThrow("Username atau password salah");
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
                })).rejects.toThrow("Username atau password salah");
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

    describe("UPDATE USER BY ID SERVICE", () => {
        beforeEach(() => {
            hashPassword.mockResolvedValue("hashed_new_password");
        });

        describe("Validation Tests", () => {
            test("should throw error if id_user is missing", async () => {
                await expect(updateUserByIdService(null, "user", "a@b.com", "Test123!x"))
                    .rejects.toThrow("ID user tidak valid");
            });

            test("should throw error if id_user is not a number", async () => {
                await expect(updateUserByIdService("abc", "user", "a@b.com", "Test123!x"))
                    .rejects.toThrow("ID user tidak valid");
            });

            test("should throw error if username too short", async () => {
                await expect(updateUserByIdService(1, "ab", "a@b.com", "Test123!x"))
                    .rejects.toThrow("Username harus minimal 3 karakter");
            });

            test("should throw error if email is invalid", async () => {
                await expect(updateUserByIdService(1, "user", "invalid", "Test123!x"))
                    .rejects.toThrow("Format email tidak valid");
            });

            test("should throw error if password is weak", async () => {
                await expect(updateUserByIdService(1, "user", "a@b.com", "weak"))
                    .rejects.toThrow("Password minimal 8 karakter");
            });
        });

        describe("Duplicate Check Tests", () => {
            test("should throw error if email already taken by another user", async () => {
                findUserByEmail.mockResolvedValue({ id_user: 2, email: "taken@b.com" });

                await expect(updateUserByIdService(1, "user", "taken@b.com", "Test123!x"))
                    .rejects.toThrow("Email sudah terdaftar");
            });

            test("should allow update if email belongs to same user", async () => {
                findUserByEmail.mockResolvedValue({ id_user: 1, email: "user@b.com" });
                findUserByUsername.mockResolvedValue(null);
                findUserById.mockResolvedValue({ id_user: 1, password: "old_hashed" });
                updateUserById.mockResolvedValue({
                    id_user: 1,
                    username: "user",
                    email: "user@b.com"
                });

                const result = await updateUserByIdService(1, "user", "user@b.com", "Test123!x");

                expect(result).toBeDefined();
                expect(result.id_user).toBe(1);
                expect(updateUserById).toHaveBeenCalledWith(1, "user", "user@b.com", "hashed_new_password");
            });

            test("should throw error if username already taken by another user", async () => {
                findUserByEmail.mockResolvedValue(null);
                findUserByUsername.mockResolvedValue({ id_user: 2, username: "taken" });

                await expect(updateUserByIdService(1, "taken", "a@b.com", "Test123!x"))
                    .rejects.toThrow("Username sudah terdaftar");
            });
        });

        describe("Success Tests", () => {
            test("should update user successfully", async () => {
                const mockUpdatedUser = {
                    id_user: 1,
                    username: "newuser",
                    email: "new@b.com"
                };

                findUserByEmail.mockResolvedValue(null);
                findUserByUsername.mockResolvedValue(null);
                findUserById.mockResolvedValue({ id_user: 1, password: "old_hashed" });
                updateUserById.mockResolvedValue(mockUpdatedUser);

                const result = await updateUserByIdService(1, "newuser", "new@b.com", "NewPass123!");

                expect(result).toBeDefined();
                expect(result.id_user).toBe(1);
                expect(result.username).toBe("newuser");
                expect(result.email).toBe("new@b.com");
                expect(result.password).toBeUndefined();
                expect(hashPassword).toHaveBeenCalledWith("NewPass123!");
                expect(updateUserById).toHaveBeenCalled();
            });

            test("should throw error if user to update not found", async () => {
                findUserByEmail.mockResolvedValue(null);
                findUserByUsername.mockResolvedValue(null);
                findUserById.mockResolvedValue({ id_user: 999, password: "old_hashed" });
                updateUserById.mockResolvedValue(null);

                await expect(updateUserByIdService(999, "user", "a@b.com", "Test123!x"))
                    .rejects.toThrow("Gagal memperbarui data user");
            });
        });
    });
});
