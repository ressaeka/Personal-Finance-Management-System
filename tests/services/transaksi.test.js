import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/models/transaksi.js", () => ({
  createTransaksi: jest.fn(),
  getAllTransaksi: jest.fn(),
  getTransaksiById: jest.fn(),
  updateTransaksi: jest.fn(),
  deleteTransaksi: jest.fn()
}));

jest.unstable_mockModule("../../src/models/category.js", () => ({
  getCategoryById: jest.fn()
}));

const { createTransaksiService, getAllTransaksiService, getTransaksiByIdService, updateTransaksiService, deleteTransaksiService } = await import("../../src/service/transaksi.js");
const { createTransaksi, getAllTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi } = await import("../../src/models/transaksi.js");
const { getCategoryById } = await import("../../src/models/category.js");

describe("TRANSAKSI SERVICE TESTS", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("CREATE TRANSAKSI SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_user is missing", async () => {
                await expect(createTransaksiService(null, 1, 10000, "Test", "2024-06-15"))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if id_category is missing", async () => {
                await expect(createTransaksiService(1, null, 10000, "Test", "2024-06-15"))
                    .rejects.toThrow("ID category tidak valid");
            });

            test("should throw error if id_category is not a number", async () => {
                await expect(createTransaksiService(1, "abc", 10000, "Test", "2024-06-15"))
                    .rejects.toThrow("ID category tidak valid");
            });

            test("should throw error if jumlah is missing", async () => {
                await expect(createTransaksiService(1, 1, undefined, "Test", "2024-06-15"))
                    .rejects.toThrow("Jumlah harus berupa angka");
            });

            test("should allow jumlah negative (converted by service)", async () => {
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                createTransaksi.mockResolvedValue({ id_transaksi: 1, jumlah: 1000 });
                const result = await createTransaksiService(1, 1, -1000, "Test", "2024-06-15");
                expect(result).toBeDefined();
                expect(createTransaksi).toHaveBeenCalledWith(1, 1, 1000, "Test", "2024-06-15");
            });

            test("should allow jumlah is 0", async () => {
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                createTransaksi.mockResolvedValue({ id_transaksi: 1, jumlah: 0 });

                const result = await createTransaksiService(1, 1, 0, "Test", "2024-06-15");
                expect(result).toBeDefined();
            });

            test("should throw error if tanggal format is invalid", async () => {
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                await expect(createTransaksiService(1, 1, 10000, "Test", "15-06-2024"))
                    .rejects.toThrow("Format tanggal tidak valid");
            });

            test("should default tanggal to current date when missing", async () => {
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                createTransaksi.mockResolvedValue({ id_transaksi: 1, jumlah: 10000 });
                const result = await createTransaksiService(1, 1, 10000, "Test", undefined);
                expect(result).toBeDefined();
            });
        });

        describe("Category Check Tests", () => {
            test("should throw error if category not found", async () => {
                getCategoryById.mockResolvedValue(null);

                await expect(createTransaksiService(1, 999, 10000, "Test", "2024-06-15"))
                    .rejects.toThrow("Category tidak ditemukan");
            });
        });

        describe("Success Tests", () => {
            test("should create transaksi successfully", async () => {
                const mockTransaksi = {
                    id_transaksi: 1,
                    id_user: 1,
                    id_category: 1,
                    jumlah: -50000,
                    deskripsi: "Belanja",
                    tanggal: "2024-06-15T00:00:00.000Z"
                };

                getCategoryById.mockResolvedValue({ id_category: 1, nama_category: "Makanan", tipe: "pengeluaran" });
                createTransaksi.mockResolvedValue(mockTransaksi);

                const result = await createTransaksiService(1, 1, 50000, "Belanja", "2024-06-15");

                expect(result).toBeDefined();
                expect(result.id_transaksi).toBe(1);
                expect(result.jumlah).toBe(-50000);
                expect(result.deskripsi).toBe("Belanja");
                expect(getCategoryById).toHaveBeenCalledWith(1, 1);
                expect(createTransaksi).toHaveBeenCalledWith(1, 1, -50000, "Belanja", "2024-06-15");
            });

            test("should create transaksi without deskripsi", async () => {
                const mockTransaksi = {
                    id_transaksi: 2,
                    id_user: 1,
                    id_category: 1,
                    jumlah: -25000,
                    deskripsi: null,
                    tanggal: "2024-06-15T00:00:00.000Z"
                };

                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pengeluaran" });
                createTransaksi.mockResolvedValue(mockTransaksi);

                const result = await createTransaksiService(1, 1, 25000, undefined, "2024-06-15");

                expect(result).toBeDefined();
                expect(result.jumlah).toBe(-25000);
                expect(createTransaksi).toHaveBeenCalledWith(1, 1, -25000, null, "2024-06-15");
            });

            test("should handle database error", async () => {
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                createTransaksi.mockRejectedValue(new Error("Database error"));

                await expect(createTransaksiService(1, 1, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("Database error");
            });

            test("should throw error if createTransaksi returns null", async () => {
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                createTransaksi.mockResolvedValue(null);

                await expect(createTransaksiService(1, 1, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("Transaksi gagal dibuat");
            });
        });
    });

    describe("GET ALL TRANSAKSI SERVICE", () => {
        test("should throw error if id_user is missing", async () => {
            await expect(getAllTransaksiService(null))
                .rejects.toThrow("User tidak valid");
        });

        test("should return all transaksi for a user", async () => {
            const mockTransaksi = [
                { id_transaksi: 1, id_user: 1, jumlah: 50000, deskripsi: "Belanja" },
                { id_transaksi: 2, id_user: 1, jumlah: 25000, deskripsi: "Makan" }
            ];
            getAllTransaksi.mockResolvedValue(mockTransaksi);

            const result = await getAllTransaksiService(1);

            expect(result).toBeDefined();
            expect(result).toHaveLength(2);
            expect(getAllTransaksi).toHaveBeenCalledWith(1);
        });

        test("should return empty array if no transaksi", async () => {
            getAllTransaksi.mockResolvedValue([]);

            const result = await getAllTransaksiService(1);

            expect(result).toHaveLength(0);
        });

        test("should handle database error", async () => {
            getAllTransaksi.mockRejectedValue(new Error("Database error"));

            await expect(getAllTransaksiService(1)).rejects.toThrow("Database error");
        });
    });

    describe("GET TRANSAKSI BY ID SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_transaksi is missing", async () => {
                await expect(getTransaksiByIdService(null, 1))
                    .rejects.toThrow("ID transaksi tidak valid");
            });

            test("should throw error if id_transaksi is not a number", async () => {
                await expect(getTransaksiByIdService("abc", 1))
                    .rejects.toThrow("ID transaksi tidak valid");
            });

            test("should throw error if id_transaksi is negative", async () => {
                await expect(getTransaksiByIdService(-1, 1))
                    .rejects.toThrow("ID transaksi tidak valid");
            });

            test("should throw error if id_user is missing", async () => {
                await expect(getTransaksiByIdService(1, null))
                    .rejects.toThrow("User tidak valid");
            });
        });

        describe("Success and Not Found Tests", () => {
            test("should return transaksi if found", async () => {
                const mockTransaksi = {
                    id_transaksi: 1,
                    id_user: 1,
                    id_category: 1,
                    jumlah: 50000,
                    deskripsi: "Belanja",
                    tanggal: "2024-06-15T00:00:00.000Z"
                };
                getTransaksiById.mockResolvedValue(mockTransaksi);

                const result = await getTransaksiByIdService(1, 1);

                expect(result).toBeDefined();
                expect(result.id_transaksi).toBe(1);
                expect(result.jumlah).toBe(50000);
                expect(getTransaksiById).toHaveBeenCalledWith(1, 1);
            });

            test("should throw 404 if transaksi not found", async () => {
                getTransaksiById.mockResolvedValue(null);

                await expect(getTransaksiByIdService(999, 1))
                    .rejects.toThrow("Transaksi tidak ditemukan");
            });

            test("should handle database error", async () => {
                getTransaksiById.mockRejectedValue(new Error("Database error"));

                await expect(getTransaksiByIdService(1, 1)).rejects.toThrow("Database error");
            });
        });
    });

    describe("UPDATE TRANSAKSI SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_transaksi is missing", async () => {
                await expect(updateTransaksiService(null, 1, 1, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("ID transaksi tidak valid");
            });

            test("should throw error if id_user is missing", async () => {
                await expect(updateTransaksiService(1, null, 1, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if id_category is invalid", async () => {
                await expect(updateTransaksiService(1, 1, "abc", 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("ID category tidak valid");
            });

            test("should throw error if jumlah is missing", async () => {
                await expect(updateTransaksiService(1, 1, 1, undefined, "Test", "2024-06-15"))
                    .rejects.toThrow("Jumlah harus berupa angka");
            });

            test("should throw error if tanggal format is invalid", async () => {
                getTransaksiById.mockResolvedValue({ id_transaksi: 1 });
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                await expect(updateTransaksiService(1, 1, 1, 50000, "Test", "invalid-date"))
                    .rejects.toThrow("Format tanggal tidak valid");
            });
        });

        describe("Not Found Tests", () => {
            test("should throw 404 if transaksi to update not found", async () => {
                getTransaksiById.mockResolvedValue(null);

                await expect(updateTransaksiService(999, 1, 1, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("Transaksi tidak ditemukan");
            });

            test("should throw error if category not found", async () => {
                getTransaksiById.mockResolvedValue({ id_transaksi: 1, id_user: 1 });
                getCategoryById.mockResolvedValue(null);

                await expect(updateTransaksiService(1, 1, 999, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("Category tidak ditemukan");
            });
        });

        describe("Success Tests", () => {
            test("should update transaksi successfully", async () => {
                const existingTransaksi = {
                    id_transaksi: 1,
                    id_user: 1,
                    id_category: 1,
                    jumlah: -50000,
                    deskripsi: "Belanja",
                    tanggal: "2024-06-15T00:00:00.000Z"
                };
                const updatedTransaksi = {
                    id_transaksi: 1,
                    id_user: 1,
                    id_category: 2,
                    jumlah: -75000,
                    deskripsi: "Belanja bulanan",
                    tanggal: "2024-06-20T00:00:00.000Z"
                };

                getTransaksiById.mockResolvedValue(existingTransaksi);
                getCategoryById.mockResolvedValue({ id_category: 2, nama_category: "Belanja", tipe: "pengeluaran" });
                updateTransaksi.mockResolvedValue(updatedTransaksi);

                const result = await updateTransaksiService(1, 1, 2, 75000, "Belanja bulanan", "2024-06-20");

                expect(result).toBeDefined();
                expect(result.jumlah).toBe(-75000);
                expect(updateTransaksi).toHaveBeenCalledWith(1, 1, 2, -75000, "Belanja bulanan", "2024-06-20");
            });

            test("should throw error if update returns null", async () => {
                getTransaksiById.mockResolvedValue({ id_transaksi: 1, id_user: 1 });
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                updateTransaksi.mockResolvedValue(null);

                await expect(updateTransaksiService(1, 1, 1, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("Transaksi gagal diupdate");
            });

            test("should handle database error", async () => {
                getTransaksiById.mockResolvedValue({ id_transaksi: 1, id_user: 1 });
                getCategoryById.mockResolvedValue({ id_category: 1, tipe: "pemasukan" });
                updateTransaksi.mockRejectedValue(new Error("Database error"));

                await expect(updateTransaksiService(1, 1, 1, 50000, "Test", "2024-06-15"))
                    .rejects.toThrow("Database error");
            });
        });
    });

    describe("DELETE TRANSAKSI SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_transaksi is missing", async () => {
                await expect(deleteTransaksiService(null, 1))
                    .rejects.toThrow("ID transaksi tidak valid");
            });

            test("should throw error if id_transaksi is not a number", async () => {
                await expect(deleteTransaksiService("abc", 1))
                    .rejects.toThrow("ID transaksi tidak valid");
            });

            test("should throw error if id_user is missing", async () => {
                await expect(deleteTransaksiService(1, null))
                    .rejects.toThrow("User tidak valid");
            });
        });

        describe("Success and Not Found Tests", () => {
            test("should delete transaksi successfully", async () => {
                const deletedTransaksi = {
                    id_transaksi: 1,
                    id_user: 1,
                    id_category: 1,
                    jumlah: 50000,
                    deskripsi: "Belanja",
                    tanggal: "2024-06-15T00:00:00.000Z"
                };
                deleteTransaksi.mockResolvedValue(deletedTransaksi);

                const result = await deleteTransaksiService(1, 1);

                expect(result).toBeDefined();
                expect(result.id_transaksi).toBe(1);
                expect(deleteTransaksi).toHaveBeenCalledWith(1, 1);
            });

            test("should throw 404 if transaksi to delete not found", async () => {
                deleteTransaksi.mockResolvedValue(null);

                await expect(deleteTransaksiService(999, 1))
                    .rejects.toThrow("Transaksi tidak ditemukan atau sudah dihapus");
            });

            test("should handle database error", async () => {
                deleteTransaksi.mockRejectedValue(new Error("Database error"));

                await expect(deleteTransaksiService(1, 1)).rejects.toThrow("Database error");
            });
        });
    });
});
