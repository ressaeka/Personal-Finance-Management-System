import { jest } from "@jest/globals";
jest.unstable_mockModule("../../../src/repositories/category.js", () => ({
  createCategory: jest.fn(),
  findCategoryById: jest.fn(),
  findAllCategory: jest.fn(),
  findCategoryByName: jest.fn(),
  findCategoryByNameIncludeDeleted: jest.fn(),
  restoreCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  countCategory: jest.fn(),
}));

const {
  createCategoryService,
  getAllCategoryService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} = await import("../../../src/services/category.js");

const repo = await import("../../../src/repositories/category.js");

const category = {
  id: 1,
  userId: 1,
  nameCategory: "Gaji",
  tipe: "PEMASUKAN",
  isDeleted: false,
};

describe("createCategoryService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should create a new category", async () => {
    repo.findCategoryByNameIncludeDeleted.mockResolvedValue(null);
    repo.createCategory.mockResolvedValue(category);

    const result = await createCategoryService(1, { nameCategory: "Gaji", tipe: "PEMASUKAN" });

    expect(repo.createCategory).toHaveBeenCalledWith({
      userId: 1,
      nameCategory: "Gaji",
      tipe: "PEMASUKAN",
    });
    expect(result.nameCategory).toBe("Gaji");
  });

  it("should reject duplicate active category", async () => {
    repo.findCategoryByNameIncludeDeleted.mockResolvedValue({ ...category, isDeleted: false });

    await expect(
      createCategoryService(1, { nameCategory: "Gaji", tipe: "PEMASUKAN" }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(repo.createCategory).not.toHaveBeenCalled();
  });

  it("should restore a soft-deleted category with same name", async () => {
    repo.findCategoryByNameIncludeDeleted.mockResolvedValue({ ...category, isDeleted: true });
    repo.restoreCategory.mockResolvedValue({ ...category, isDeleted: false });

    const result = await createCategoryService(1, { nameCategory: "Gaji", tipe: "PENGELUARAN" });

    expect(repo.restoreCategory).toHaveBeenCalledWith(1, "PENGELUARAN");
    expect(repo.createCategory).not.toHaveBeenCalled();
    expect(result.isDeleted).toBe(false);
  });
});

describe("getAllCategoryService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return paginated categories", async () => {
    repo.findAllCategory.mockResolvedValue([category]);
    repo.countCategory.mockResolvedValue(1);

    const result = await getAllCategoryService(1, { page: 1, limit: 50 });

    expect(result.pagination).toEqual({ page: 1, limit: 50, totalData: 1, totalPage: 1 });
    expect(result.data).toHaveLength(1);
    expect(repo.findAllCategory).toHaveBeenCalledWith({ userId: 1, skip: 0, take: 50 });
  });

  it("should compute skip correctly for page 3", async () => {
    repo.findAllCategory.mockResolvedValue([]);
    repo.countCategory.mockResolvedValue(25);

    await getAllCategoryService(1, { page: 3, limit: 10 });

    expect(repo.findAllCategory).toHaveBeenCalledWith({ userId: 1, skip: 20, take: 10 });
    expect(repo.countCategory).toHaveBeenCalledWith(1);
  });
});

describe("getCategoryByIdService", () => {
  it("should return category", async () => {
    repo.findCategoryById.mockResolvedValue(category);

    const result = await getCategoryByIdService(1, 1);

    expect(repo.findCategoryById).toHaveBeenCalledWith({ id: 1, userId: 1, isDeleted: false });
    expect(result.id).toBe(1);
  });

  it("should throw 404 when not found", async () => {
    repo.findCategoryById.mockResolvedValue(null);

    await expect(getCategoryByIdService(999, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("updateCategoryService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should update category name", async () => {
    repo.findCategoryById.mockResolvedValue(category);
    repo.findCategoryByName.mockResolvedValue(null);
    repo.updateCategory.mockResolvedValue({ ...category, nameCategory: "Gaji Baru" });

    const result = await updateCategoryService(1, 1, { nameCategory: "Gaji Baru" });

    expect(repo.updateCategory).toHaveBeenCalledWith(1, 1, { nameCategory: "Gaji Baru" });
    expect(result.nameCategory).toBe("Gaji Baru");
  });

  it("should throw 404 when category not found", async () => {
    repo.findCategoryById.mockResolvedValue(null);

    await expect(updateCategoryService(999, 1, { nameCategory: "X" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should throw 409 when name used by another category", async () => {
    repo.findCategoryById.mockResolvedValue(category);
    repo.findCategoryByName.mockResolvedValue({ ...category, id: 2 });

    await expect(updateCategoryService(1, 1, { nameCategory: "Dipakai" })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("should update tipe only", async () => {
    repo.findCategoryById.mockResolvedValue(category);
    repo.updateCategory.mockResolvedValue({ ...category, tipe: "PENGELUARAN" });

    await updateCategoryService(1, 1, { tipe: "PENGELUARAN" });

    expect(repo.updateCategory).toHaveBeenCalledWith(1, 1, { tipe: "PENGELUARAN" });
  });
});

describe("deleteCategoryService", () => {
  it("should soft delete category", async () => {
    repo.findCategoryById.mockResolvedValue(category);
    repo.deleteCategory.mockResolvedValue({ id: 1, deletedAt: new Date() });

    const result = await deleteCategoryService(1, 1);

    expect(repo.deleteCategory).toHaveBeenCalledWith(1, 1);
    expect(result.deletedAt).toBeDefined();
  });

  it("should throw 404 when not found", async () => {
    repo.findCategoryById.mockResolvedValue(null);

    await expect(deleteCategoryService(999, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});
