import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/models/laporan.js", () => ({
  upsertLaporan: jest.fn(),
  getAllLaporan: jest.fn(),
  getLaporanByPeriode: jest.fn(),
  generateLaporanBulanan: jest.fn(),
  rekapOtomatis: jest.fn(),
  deleteLaporan: jest.fn()
}));

const {
  generateLaporanService,
  getAllLaporanService,
  getLaporanByPeriodeService,
  rekapOtomatisService,
  deleteLaporanService
} = await import("../../src/service/laporan.js");

const {
  upsertLaporan,
  getAllLaporan,
  getLaporanByPeriode,
  generateLaporanBulanan,
  rekapOtomatis,
  deleteLaporan
} = await import("../../src/models/laporan.js");

describe("LAPORAN SERVICE TESTS", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("GENERATE LAPORAN SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_user is missing", async () => {
                await expect(generateLaporanService(null, 2024, 6))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if id_user is not a positive integer", async () => {
                await expect(generateLaporanService(-1, 2024, 6))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if tahun is missing", async () => {
                await expect(generateLaporanService(1, null, 6))
                    .rejects.toThrow("Tahun dan bulan harus diisi");
            });

            test("should throw error if bulan is missing", async () => {
                await expect(generateLaporanService(1, 2024, null))
                    .rejects.toThrow("Tahun dan bulan harus diisi");
            });

            test("should throw error if tahun is not a number", async () => {
                await expect(generateLaporanService(1, "abc", 6))
                    .rejects.toThrow("Tahun tidak valid");
            });

            test("should throw error if tahun is below 2000", async () => {
                await expect(generateLaporanService(1, 1999, 6))
                    .rejects.toThrow("Tahun tidak valid");
            });

            test("should throw error if tahun is above 2100", async () => {
                await expect(generateLaporanService(1, 2101, 6))
                    .rejects.toThrow("Tahun tidak valid");
            });

            test("should throw error if bulan is below 1", async () => {
                await expect(generateLaporanService(1, 2024, -1))
                    .rejects.toThrow("Bulan tidak valid");
            });

            test("should throw error if bulan is above 12", async () => {
                await expect(generateLaporanService(1, 2024, 13))
                    .rejects.toThrow("Bulan tidak valid");
            });
        });

        describe("Error Handling Tests", () => {
            test("should throw error if generateLaporanBulanan returns null", async () => {
                generateLaporanBulanan.mockResolvedValue(null);

                await expect(generateLaporanService(1, 2024, 6))
                    .rejects.toThrow("Internal Server Error");
            });
        });

        describe("Success Tests", () => {
            test("should generate laporan successfully", async () => {
                const mockLaporan = {
                    id_laporan: 1,
                    id_user: 1,
                    periode: "2024-06",
                    total_pemasukan: "100000.00",
                    total_pengeluaran: "-50000.00",
                    saldo: "50000.00"
                };
                generateLaporanBulanan.mockResolvedValue(mockLaporan);

                const result = await generateLaporanService(1, 2024, 6);
                expect(result).toBeDefined();
                expect(result.id_laporan).toBe(1);
                expect(result.periode).toBe("2024-06");
                expect(generateLaporanBulanan).toHaveBeenCalledWith(1, 2024, 6);
            });

            test("should accept string numbers for tahun and bulan", async () => {
                generateLaporanBulanan.mockResolvedValue({ id_laporan: 1 });

                const result = await generateLaporanService(1, "2024", "6");
                expect(result).toBeDefined();
                expect(generateLaporanBulanan).toHaveBeenCalledWith(1, 2024, 6);
            });
        });
    });

    describe("GET ALL LAPORAN SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_user is missing", async () => {
                await expect(getAllLaporanService(null))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if id_user is not a positive integer", async () => {
                await expect(getAllLaporanService("abc"))
                    .rejects.toThrow("User tidak valid");
            });
        });

        describe("Success Tests", () => {
            test("should return all laporan for user", async () => {
                const mockLaporan = [
                    { id_laporan: 1, periode: "2024-06" },
                    { id_laporan: 2, periode: "2024-05" }
                ];
                getAllLaporan.mockResolvedValue(mockLaporan);

                const result = await getAllLaporanService(1);
                expect(result).toHaveLength(2);
                expect(getAllLaporan).toHaveBeenCalledWith(1);
            });

            test("should return empty array if no laporan exist", async () => {
                getAllLaporan.mockResolvedValue([]);

                const result = await getAllLaporanService(1);
                expect(result).toEqual([]);
            });
        });
    });

    describe("GET LAPORAN BY PERIODE SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_user is missing", async () => {
                await expect(getLaporanByPeriodeService(null, "2024-06"))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if periode is missing", async () => {
                await expect(getLaporanByPeriodeService(1, null))
                    .rejects.toThrow("Periode harus diisi");
            });

            test("should throw error if periode format is invalid", async () => {
                await expect(getLaporanByPeriodeService(1, "2024/06"))
                    .rejects.toThrow("Format periode tidak valid");
            });

            test("should throw error if periode format is incomplete", async () => {
                await expect(getLaporanByPeriodeService(1, "2024"))
                    .rejects.toThrow("Format periode tidak valid");
            });
        });

        describe("Error Handling Tests", () => {
            test("should throw 404 if laporan not found", async () => {
                getLaporanByPeriode.mockResolvedValue(null);

                await expect(getLaporanByPeriodeService(1, "2024-06"))
                    .rejects.toThrow("Laporan tidak ditemukan");
            });
        });

        describe("Success Tests", () => {
            test("should return laporan by periode", async () => {
                const mockLaporan = {
                    id_laporan: 1,
                    periode: "2024-06",
                    total_pemasukan: "100000.00"
                };
                getLaporanByPeriode.mockResolvedValue(mockLaporan);

                const result = await getLaporanByPeriodeService(1, "2024-06");
                expect(result).toBeDefined();
                expect(result.periode).toBe("2024-06");
                expect(getLaporanByPeriode).toHaveBeenCalledWith(1, "2024-06");
            });
        });
    });

    describe("REKAP OTOMATIS SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_user is missing", async () => {
                await expect(rekapOtomatisService(null, "2024-06-15"))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if tanggal is missing", async () => {
                await expect(rekapOtomatisService(1, null))
                    .rejects.toThrow("Tanggal harus diisi");
            });

            test("should throw error if tanggal format is invalid", async () => {
                await expect(rekapOtomatisService(1, "15-06-2024"))
                    .rejects.toThrow("Format tanggal tidak valid");
            });

            test("should throw error if tanggal is not a real date", async () => {
                await expect(rekapOtomatisService(1, "2024-13-01"))
                    .rejects.toThrow("Format tanggal tidak valid");
            });
        });

        describe("Success Tests", () => {
            test("should return updated laporan array", async () => {
                const mockUpdated = [
                    { id_laporan: 1, periode: "2024-06", total_pemasukan: "50000.00" }
                ];
                rekapOtomatis.mockResolvedValue(mockUpdated);

                const result = await rekapOtomatisService(1, "2024-06-15");
                expect(result).toHaveLength(1);
                expect(rekapOtomatis).toHaveBeenCalledWith(1, "2024-06-15");
            });

            test("should return empty array if no laporan to rekap", async () => {
                rekapOtomatis.mockResolvedValue([]);

                const result = await rekapOtomatisService(1, "2024-06-15");
                expect(result).toEqual([]);
            });
        });
    });

    describe("DELETE LAPORAN SERVICE", () => {
        describe("Validation Tests", () => {
            test("should throw error if id_laporan is missing", async () => {
                await expect(deleteLaporanService(null, 1))
                    .rejects.toThrow("ID laporan tidak valid");
            });

            test("should throw error if id_laporan is not a positive integer", async () => {
                await expect(deleteLaporanService("abc", 1))
                    .rejects.toThrow("ID laporan tidak valid");
            });

            test("should throw error if id_user is missing", async () => {
                await expect(deleteLaporanService(1, null))
                    .rejects.toThrow("User tidak valid");
            });

            test("should throw error if id_user is not a positive integer", async () => {
                await expect(deleteLaporanService(1, "abc"))
                    .rejects.toThrow("User tidak valid");
            });
        });

        describe("Error Handling Tests", () => {
            test("should throw 404 if laporan not found", async () => {
                deleteLaporan.mockResolvedValue(null);

                await expect(deleteLaporanService(999, 1))
                    .rejects.toThrow("Laporan tidak ditemukan");
            });
        });

        describe("Success Tests", () => {
            test("should delete laporan successfully", async () => {
                deleteLaporan.mockResolvedValue({ id_laporan: 1 });

                const result = await deleteLaporanService(1, 1);
                expect(result).toBeDefined();
                expect(result.id_laporan).toBe(1);
                expect(deleteLaporan).toHaveBeenCalledWith(1, 1);
            });
        });
    });
});
