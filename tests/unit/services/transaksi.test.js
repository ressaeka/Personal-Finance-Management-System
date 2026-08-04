import { jest } from "@jest/globals";
jest.unstable_mockModule("../../../src/repositories/transaksi.js", () => ({
  createTransaksi: jest.fn(),
  findAllTransaksi: jest.fn(),
  findTransaksiById: jest.fn(),
  countTransaksi: jest.fn(),
  updateTransaksi: jest.fn(),
  deleteTransaksi: jest.fn(),
}));

jest.unstable_mockModule("../../../src/repositories/category.js", () => ({
  findCategoryById: jest.fn(),
}));

const {
  createTransaksiService,
  findAllTransaksiService,
  findTransaksiByIdService,
  updateTransaksiService,
  deleteTransaksiService,
} = await import("../../../src/services/transaksi.js");

const repo = await import("../../../src/repositories/transaksi.js");
const categoryRepo = await import("../../../src/repositories/category.js");

const pemasukanCategory = { id: 1, nameCategory: "Gaji", tipe: "PEMASUKAN" };
const pengeluaranCategory = { id: 2, nameCategory: "Makanan", tipe: "PENGELUARAN" };

const transaksi = {
  id: 1,
  userId: 1,
  categoryId: 1,
  jumlah: 5000000,
  deskripsi: "Gaji bulan Juli",
  tanggal: new Date("2026-07-01"),
};

describe("createTransaksiService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should store positive amount for PEMASUKAN", async () => {
    categoryRepo.findCategoryById.mockResolvedValue(pemasukanCategory);
    repo.createTransaksi.mockResolvedValue(transaksi);

    const result = await createTransaksiService(1, {
      categoryId: 1,
      jumlah: 5000000,
      deskripsi: "Gaji bulan Juli",
    });

    expect(repo.createTransaksi).toHaveBeenCalledWith(
      expect.objectContaining({ jumlah: 5000000, deskripsi: "Gaji bulan Juli" }),
    );
    expect(result.jumlah).toBe(5000000);
  });

  it("should store negative amount for PENGELUARAN", async () => {
    categoryRepo.findCategoryById.mockResolvedValue(pengeluaranCategory);
    repo.createTransaksi.mockResolvedValue({ ...transaksi, categoryId: 2, jumlah: -250000 });

    await createTransaksiService(1, { categoryId: 2, jumlah: 250000 });

    expect(repo.createTransaksi).toHaveBeenCalledWith(expect.objectContaining({ jumlah: -250000 }));
  });

  it("should default deskripsi to null and use current date", async () => {
    categoryRepo.findCategoryById.mockResolvedValue(pemasukanCategory);
    repo.createTransaksi.mockResolvedValue(transaksi);

    await createTransaksiService(1, { categoryId: 1, jumlah: 100000 });

    expect(repo.createTransaksi).toHaveBeenCalledWith(
      expect.objectContaining({ deskripsi: null, tanggal: expect.any(Date) }),
    );
  });

  it("should throw 404 when category not found", async () => {
    categoryRepo.findCategoryById.mockResolvedValue(null);

    await expect(createTransaksiService(1, { categoryId: 999, jumlah: 100 })).rejects.toMatchObject(
      {
        statusCode: 404,
        message: expect.stringContaining("Category"),
      },
    );
  });
});

describe("findAllTransaksiService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return paginated transactions", async () => {
    repo.findAllTransaksi.mockResolvedValue([transaksi]);
    repo.countTransaksi.mockResolvedValue(1);

    const result = await findAllTransaksiService(1, { page: 1, limit: 10 });

    expect(result.pagination).toEqual({ page: 1, limit: 10, totalData: 1, totalPages: 1 });
    expect(repo.findAllTransaksi).toHaveBeenCalledWith({ userId: 1, skip: 0, take: 10 });
  });

  it("should guard against invalid page/limit", async () => {
    repo.findAllTransaksi.mockResolvedValue([]);
    repo.countTransaksi.mockResolvedValue(0);

    const result = await findAllTransaksiService(1, { page: 0, limit: "abc" });

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });
});

describe("findTransaksiByIdService", () => {
  it("should return transaction", async () => {
    repo.findTransaksiById.mockResolvedValue(transaksi);

    const result = await findTransaksiByIdService(1, 1);

    expect(repo.findTransaksiById).toHaveBeenCalledWith({ id: 1, userId: 1, isDeleted: false });
    expect(result.id).toBe(1);
  });

  it("should throw 404 when not found", async () => {
    repo.findTransaksiById.mockResolvedValue(null);

    await expect(findTransaksiByIdService(999, 1)).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining("Transaksi"),
    });
  });
});

describe("updateTransaksiService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should update deskripsi only", async () => {
    repo.findTransaksiById.mockResolvedValue(transaksi);
    categoryRepo.findCategoryById.mockResolvedValue(pemasukanCategory);
    repo.updateTransaksi.mockResolvedValue({ ...transaksi, deskripsi: "Updated" });

    const result = await updateTransaksiService(1, 1, { deskripsi: "Updated" });

    expect(repo.updateTransaksi).toHaveBeenCalledWith(1, 1, { deskripsi: "Updated" });
    expect(result.deskripsi).toBe("Updated");
  });

  it("should re-normalize amount when category changes", async () => {
    repo.findTransaksiById.mockResolvedValue({ ...transaksi, categoryId: 1, jumlah: 5000000 });
    categoryRepo.findCategoryById.mockResolvedValue(pengeluaranCategory);
    repo.updateTransaksi.mockResolvedValue({ ...transaksi, categoryId: 2, jumlah: -300000 });

    await updateTransaksiService(1, 1, { categoryId: 2, jumlah: 300000 });

    expect(repo.updateTransaksi).toHaveBeenCalledWith(1, 1, { categoryId: 2, jumlah: -300000 });
  });

  it("should throw 404 when transaction not found", async () => {
    repo.findTransaksiById.mockResolvedValue(null);

    await expect(updateTransaksiService(999, 1, { deskripsi: "x" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should throw 404 when new category not found", async () => {
    repo.findTransaksiById.mockResolvedValue(transaksi);
    categoryRepo.findCategoryById.mockResolvedValue(null);

    await expect(updateTransaksiService(1, 1, { categoryId: 999 })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("deleteTransaksiService", () => {
  it("should soft delete transaction", async () => {
    repo.findTransaksiById.mockResolvedValue(transaksi);
    repo.deleteTransaksi.mockResolvedValue({ id: 1, deletedAt: new Date() });

    const result = await deleteTransaksiService(1, 1);

    expect(repo.deleteTransaksi).toHaveBeenCalledWith(1, 1);
    expect(result.deletedAt).toBeDefined();
  });

  it("should throw 404 when not found", async () => {
    repo.findTransaksiById.mockResolvedValue(null);

    await expect(deleteTransaksiService(999, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});
