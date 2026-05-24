import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/models/category.js", () => ({
  createCategory: jest.fn(),
  getAllCategory: jest.fn()
}));

const { categoryService, getAllCategoryService } = await import("../../src/service/category.js");
const { createCategory, getAllCategory } = await import("../../src/models/category.js");

describe("CATEGORY SERVICE TESTS", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Validation Tests", () => {
        test("should throw error if id_user is missing", async () => {
            await expect(categoryService(null, "Makanan", "pengeluaran"))
                .rejects.toThrow("User tidak ditemukan");
        });

        test("should throw error if nama_category is empty", async () => {
            await expect(categoryService(1, "", "pengeluaran"))
                .rejects.toThrow("Category harus diisi dan minimal 3 karakter");
        });

        test("should throw error if nama_category is less than 3 characters", async () => {
            await expect(categoryService(1, "ab", "pengeluaran"))
                .rejects.toThrow("Category harus diisi dan minimal 3 karakter");
        });

        test("should throw error if tipe is empty", async () => {
            await expect(categoryService(1, "Makanan", ""))
                .rejects.toThrow("Tipe harus diisi dan harus 'pemasukan' atau 'pengeluaran'");
        });

        test("should throw error if tipe is invalid", async () => {
            await expect(categoryService(1, "Makanan", "investasi"))
                .rejects.toThrow("Tipe harus diisi dan harus 'pemasukan' atau 'pengeluaran'");
        });
    });

    describe("Success Tests", () => {
        test("should create category with tipe pemasukan", async () => {
            const mockCategory = {
                id_category: 1,
                id_user: 1,
                nama_category: "Gaji",
                tipe: "pemasukan"
            };
            createCategory.mockResolvedValue(mockCategory);

            const result = await categoryService(1, "Gaji", "pemasukan");

            expect(result).toBeDefined();
            expect(result.id_category).toBe(1);
            expect(result.nama_category).toBe("Gaji");
            expect(result.tipe).toBe("pemasukan");
            expect(createCategory).toHaveBeenCalledWith(1, "Gaji", "pemasukan");
        });

        test("should create category with tipe pengeluaran", async () => {
            const mockCategory = {
                id_category: 2,
                id_user: 1,
                nama_category: "Makanan",
                tipe: "pengeluaran"
            };
            createCategory.mockResolvedValue(mockCategory);

            const result = await categoryService(1, "Makanan", "pengeluaran");

            expect(result).toBeDefined();
            expect(result.nama_category).toBe("Makanan");
            expect(result.tipe).toBe("pengeluaran");
            expect(createCategory).toHaveBeenCalledWith(1, "Makanan", "pengeluaran");
        });
    });

    describe("Error Handling Tests", () => {
        test("should throw error if createCategory returns null", async () => {
            createCategory.mockResolvedValue(null);

            await expect(categoryService(1, "Makanan", "pengeluaran"))
                .rejects.toThrow("Category gagal dibuat");
        });

        test("should throw error if createCategory throws", async () => {
            createCategory.mockRejectedValue(new Error("Database error"));

            await expect(categoryService(1, "Makanan", "pengeluaran"))
                .rejects.toThrow("Database error");
        });
    });

    describe("GET ALL CATEGORY SERVICE", () => {
        test("should return all categories for a user", async () => {
            const mockCategories = [
                { id_category: 1, id_user: 1, nama_category: "Makanan", tipe: "pengeluaran" },
                { id_category: 2, id_user: 1, nama_category: "Gaji", tipe: "pemasukan" }
            ];
            getAllCategory.mockResolvedValue(mockCategories);

            const result = await getAllCategoryService(1);

            expect(result).toBeDefined();
            expect(result).toHaveLength(2);
            expect(result[0].nama_category).toBe("Makanan");
            expect(result[1].nama_category).toBe("Gaji");
            expect(getAllCategory).toHaveBeenCalledWith(1);
        });

        test("should return empty array if no categories", async () => {
            getAllCategory.mockResolvedValue([]);

            const result = await getAllCategoryService(999);

            expect(result).toBeDefined();
            expect(result).toHaveLength(0);
            expect(getAllCategory).toHaveBeenCalledWith(999);
        });

        test("should handle database error", async () => {
            getAllCategory.mockRejectedValue(new Error("Database error"));

            await expect(getAllCategoryService(1)).rejects.toThrow("Database error");
        });
    });
});
