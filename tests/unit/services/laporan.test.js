import { jest } from "@jest/globals";
jest.unstable_mockModule("../../../src/repositories/laporan.js", () => ({
  findTransactions: jest.fn(),
  countTransactions: jest.fn(),
  aggregateTransactions: jest.fn(),
  groupByCategory: jest.fn(),
}));

const { getLaporanService } = await import("../../../src/services/laporan.js");

const repo = await import("../../../src/repositories/laporan.js");

const transactions = [
  { id: 1, jumlah: 5000000, category: { id: 1, tipe: "PEMASUKAN" } },
  { id: 2, jumlah: -250000, category: { id: 2, tipe: "PENGELUARAN" } },
];

const summary = {
  _count: { id: 2 },
  _sum: { jumlah: 4750000 },
  _avg: { jumlah: 2375000 },
  _max: { jumlah: 5000000 },
  _min: { jumlah: -250000 },
};

describe("getLaporanService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should throw 401 when userId missing", async () => {
    await expect(getLaporanService(undefined, {})).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should return mapped summary with defaults", async () => {
    repo.findTransactions.mockResolvedValue(transactions);
    repo.countTransactions.mockResolvedValue(2);
    repo.aggregateTransactions.mockResolvedValue(summary);
    repo.groupByCategory.mockResolvedValue([]);

    const result = await getLaporanService(1, {});

    expect(result.summary).toEqual({
      totalTransactions: 2,
      totalAmount: 4750000,
      averageAmount: 2375000,
      highestTransaction: 5000000,
      lowestTransaction: -250000,
    });
    expect(result.pagination).toEqual({ page: 1, limit: 10, totalData: 2, totalPages: 1 });
    expect(result.transactions).toHaveLength(2);
    expect(repo.findTransactions).toHaveBeenCalledWith({
      where: { userId: 1, isDeleted: false },
      skip: 0,
      take: 10,
    });
  });

  it("should fallback summary values to 0 when aggregate empty", async () => {
    const empty = {
      _count: { id: 0 },
      _sum: { jumlah: null },
      _avg: { jumlah: null },
      _max: { jumlah: null },
      _min: { jumlah: null },
    };
    repo.findTransactions.mockResolvedValue([]);
    repo.countTransactions.mockResolvedValue(0);
    repo.aggregateTransactions.mockResolvedValue(empty);
    repo.groupByCategory.mockResolvedValue([]);

    const result = await getLaporanService(1, {});

    expect(result.summary).toEqual({
      totalTransactions: 0,
      totalAmount: 0,
      averageAmount: 0,
      highestTransaction: 0,
      lowestTransaction: 0,
    });
  });

  it("should apply categoryId and tipe filters", async () => {
    repo.findTransactions.mockResolvedValue([]);
    repo.countTransactions.mockResolvedValue(0);
    repo.aggregateTransactions.mockResolvedValue(summary);
    repo.groupByCategory.mockResolvedValue([]);

    await getLaporanService(1, { categoryId: "2", tipe: "PENGELUARAN", page: 2, limit: 5 });

    const where = repo.findTransactions.mock.calls[0][0].where;
    expect(where.categoryId).toBe(2);
    expect(where.category).toEqual({ tipe: "PENGELUARAN" });
    expect(repo.findTransactions.mock.calls[0][0].skip).toBe(5);
    expect(repo.findTransactions.mock.calls[0][0].take).toBe(5);
  });

  it("should apply date range filter", async () => {
    repo.findTransactions.mockResolvedValue([]);
    repo.countTransactions.mockResolvedValue(0);
    repo.aggregateTransactions.mockResolvedValue(summary);
    repo.groupByCategory.mockResolvedValue([]);

    await getLaporanService(1, { startDate: "2026-07-01", endDate: "2026-07-31" });

    const where = repo.findTransactions.mock.calls[0][0].where;
    expect(where.tanggal).toBeDefined();
    expect(where.tanggal.gte).toBeInstanceOf(Date);
    expect(where.tanggal.lte).toBeInstanceOf(Date);
  });

  it("should guard invalid page/limit values", async () => {
    repo.findTransactions.mockResolvedValue([]);
    repo.countTransactions.mockResolvedValue(0);
    repo.aggregateTransactions.mockResolvedValue(summary);
    repo.groupByCategory.mockResolvedValue([]);

    const result = await getLaporanService(1, { page: -3, limit: "abc" });

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });
});
