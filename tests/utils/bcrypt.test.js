import { hashPassword, comparePassword } from "../../src/utils/bcrypt.js";

describe("Bcrypt Utils", () => {
    describe("hashPassword", () => {
        test("should hash password successfully", async () => {
            const password = "Test123!@#";
            const hashed = await hashPassword(password);
            
            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(password);
            expect(typeof hashed).toBe("string");
            expect(hashed.length).toBeGreaterThan(50);
        });
        
        test("should return different hash for same password", async () => {
            const password = "Test123!@#";
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            
            expect(hash1).not.toBe(hash2);
        });
    });
    
    describe("comparePassword", () => {
        test("should return true for correct password", async () => {
            const password = "Test123!@#";
            const hashed = await hashPassword(password);
            const result = await comparePassword(password, hashed);
            
            expect(result).toBe(true);
        });
        
        test("should return false for incorrect password", async () => {
            const password = "Test123!@#";
            const hashed = await hashPassword(password);
            const result = await comparePassword("WrongPass123", hashed);
            
            expect(result).toBe(false);
        });
    });
});