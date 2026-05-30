import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/models/category.js', () => ({
  createCategory: jest.fn(),
  getAllCategory: jest.fn(),
  getCategoryById: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
}));

const {
  categoryService,
  getAllCategoryService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} = await import('../../src/service/category.js');
const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = await import('../../src/models/category.js');

describe('CATEGORY SERVICE TESTS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Tests', () => {
    test('should throw error if id_user is missing', async () => {
      await expect(
        categoryService(null, 'Makanan', 'pengeluaran'),
      ).rejects.toThrow('User tidak ditemukan');
    });

    test('should throw error if nama_category is empty', async () => {
      await expect(categoryService(1, '', 'pengeluaran')).rejects.toThrow(
        'Category harus diisi dan minimal 3 karakter',
      );
    });

    test('should throw error if nama_category is less than 3 characters', async () => {
      await expect(categoryService(1, 'ab', 'pengeluaran')).rejects.toThrow(
        'Category harus diisi dan minimal 3 karakter',
      );
    });

    test('should throw error if tipe is empty', async () => {
      await expect(categoryService(1, 'Makanan', '')).rejects.toThrow(
        "Tipe harus diisi dan harus 'pemasukan' atau 'pengeluaran'",
      );
    });

    test('should throw error if tipe is invalid', async () => {
      await expect(categoryService(1, 'Makanan', 'investasi')).rejects.toThrow(
        "Tipe harus diisi dan harus 'pemasukan' atau 'pengeluaran'",
      );
    });
  });

  describe('Success Tests', () => {
    test('should create category with tipe pemasukan', async () => {
      const mockCategory = {
        id_category: 1,
        id_user: 1,
        nama_category: 'Gaji',
        tipe: 'pemasukan',
      };
      getAllCategory.mockResolvedValue([]);
      createCategory.mockResolvedValue(mockCategory);

      const result = await categoryService(1, 'Gaji', 'pemasukan');

      expect(result).toBeDefined();
      expect(result.id_category).toBe(1);
      expect(result.nama_category).toBe('Gaji');
      expect(result.tipe).toBe('pemasukan');
      expect(createCategory).toHaveBeenCalledWith(1, 'Gaji', 'pemasukan');
    });

    test('should create category with tipe pengeluaran', async () => {
      const mockCategory = {
        id_category: 2,
        id_user: 1,
        nama_category: 'Makanan',
        tipe: 'pengeluaran',
      };
      getAllCategory.mockResolvedValue([]);
      createCategory.mockResolvedValue(mockCategory);

      const result = await categoryService(1, 'Makanan', 'pengeluaran');

      expect(result).toBeDefined();
      expect(result.nama_category).toBe('Makanan');
      expect(result.tipe).toBe('pengeluaran');
      expect(createCategory).toHaveBeenCalledWith(1, 'Makanan', 'pengeluaran');
    });
  });

  describe('Error Handling Tests', () => {
    test('should throw error if createCategory returns null', async () => {
      getAllCategory.mockResolvedValue([]);
      createCategory.mockResolvedValue(null);

      await expect(
        categoryService(1, 'Makanan', 'pengeluaran'),
      ).rejects.toThrow('Category gagal dibuat');
    });

    test('should throw error if createCategory throws', async () => {
      getAllCategory.mockResolvedValue([]);
      createCategory.mockRejectedValue(new Error('Database error'));

      await expect(
        categoryService(1, 'Makanan', 'pengeluaran'),
      ).rejects.toThrow('Database error');
    });

    test('should throw error if duplicate nama_category', async () => {
      getAllCategory.mockResolvedValue([
        { id_category: 1, nama_category: 'Makanan', tipe: 'pengeluaran' },
      ]);

      await expect(
        categoryService(1, 'Makanan', 'pengeluaran'),
      ).rejects.toThrow('Nama category sudah ada');
    });
  });

  describe('GET ALL CATEGORY SERVICE', () => {
    test('should return all categories for a user', async () => {
      const mockCategories = [
        {
          id_category: 1,
          id_user: 1,
          nama_category: 'Makanan',
          tipe: 'pengeluaran',
        },
        {
          id_category: 2,
          id_user: 1,
          nama_category: 'Gaji',
          tipe: 'pemasukan',
        },
      ];
      getAllCategory.mockResolvedValue(mockCategories);

      const result = await getAllCategoryService(1);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].nama_category).toBe('Makanan');
      expect(result[1].nama_category).toBe('Gaji');
      expect(getAllCategory).toHaveBeenCalledWith(1);
    });

    test('should return empty array if no categories', async () => {
      getAllCategory.mockResolvedValue([]);

      const result = await getAllCategoryService(999);

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
      expect(getAllCategory).toHaveBeenCalledWith(999);
    });

    test('should handle database error', async () => {
      getAllCategory.mockRejectedValue(new Error('Database error'));

      await expect(getAllCategoryService(1)).rejects.toThrow('Database error');
    });
  });

  describe('GET CATEGORY BY ID SERVICE', () => {
    describe('Validation Tests', () => {
      test('should throw error if id_category is missing', async () => {
        await expect(getCategoryByIdService(null, 1)).rejects.toThrow(
          'ID category tidak valid',
        );
      });

      test('should throw error if id_category is not a number', async () => {
        await expect(getCategoryByIdService('abc', 1)).rejects.toThrow(
          'ID category tidak valid',
        );
      });

      test('should throw error if id_category is negative', async () => {
        await expect(getCategoryByIdService(-1, 1)).rejects.toThrow(
          'ID category tidak valid',
        );
      });

      test('should throw error if id_user is missing', async () => {
        await expect(getCategoryByIdService(1, null)).rejects.toThrow(
          'User tidak ditemukan',
        );
      });
    });

    describe('Success and Not Found Tests', () => {
      test('should return category if found', async () => {
        const mockCategory = {
          id_category: 1,
          id_user: 1,
          nama_category: 'Makanan',
          tipe: 'pengeluaran',
        };
        getCategoryById.mockResolvedValue(mockCategory);

        const result = await getCategoryByIdService(1, 1);

        expect(result).toBeDefined();
        expect(result.id_category).toBe(1);
        expect(result.nama_category).toBe('Makanan');
        expect(getCategoryById).toHaveBeenCalledWith(1, 1);
      });

      test('should throw error if category not found', async () => {
        getCategoryById.mockResolvedValue(null);

        await expect(getCategoryByIdService(999, 1)).rejects.toThrow(
          'Category tidak ditemukan',
        );
      });

      test('should handle database error', async () => {
        getCategoryById.mockRejectedValue(new Error('Database error'));

        await expect(getCategoryByIdService(1, 1)).rejects.toThrow(
          'Database error',
        );
      });
    });
  });

  describe('UPDATE CATEGORY SERVICE', () => {
    describe('Validation Tests', () => {
      test('should throw error if id_category is missing', async () => {
        await expect(
          updateCategoryService(null, 1, 'Makanan', 'pengeluaran'),
        ).rejects.toThrow('ID category tidak valid');
      });

      test('should throw error if id_category is not a number', async () => {
        await expect(
          updateCategoryService('abc', 1, 'Makanan', 'pengeluaran'),
        ).rejects.toThrow('ID category tidak valid');
      });

      test('should throw error if id_user is missing', async () => {
        await expect(
          updateCategoryService(1, null, 'Makanan', 'pengeluaran'),
        ).rejects.toThrow('User tidak ditemukan');
      });

      test('should throw error if nama_category is too short', async () => {
        await expect(
          updateCategoryService(1, 1, 'ab', 'pengeluaran'),
        ).rejects.toThrow('Nama category minimal 3 karakter');
      });

      test('should throw error if tipe is invalid', async () => {
        await expect(
          updateCategoryService(1, 1, 'Makanan', 'investasi'),
        ).rejects.toThrow("Tipe harus 'pemasukan' atau 'pengeluaran'");
      });
    });

    describe('Success and Not Found Tests', () => {
      test('should update category successfully', async () => {
        const existingCategory = {
          id_category: 1,
          id_user: 1,
          nama_category: 'Makanan',
          tipe: 'pengeluaran',
        };
        const updatedCategory = {
          id_category: 1,
          id_user: 1,
          nama_category: 'Minuman',
          tipe: 'pengeluaran',
        };

        getCategoryById.mockResolvedValue(existingCategory);
        updateCategory.mockResolvedValue(updatedCategory);

        const result = await updateCategoryService(
          1,
          1,
          'Minuman',
          'pengeluaran',
        );

        expect(result).toBeDefined();
        expect(result.nama_category).toBe('Minuman');
        expect(updateCategory).toHaveBeenCalledWith(
          1,
          1,
          'Minuman',
          'pengeluaran',
        );
      });

      test('should throw error if category to update not found', async () => {
        getCategoryById.mockResolvedValue(null);

        await expect(
          updateCategoryService(999, 1, 'Makanan', 'pengeluaran'),
        ).rejects.toThrow('Category tidak ditemukan');
      });

      test('should throw error if update returns null', async () => {
        const existingCategory = {
          id_category: 1,
          id_user: 1,
          nama_category: 'Makanan',
          tipe: 'pengeluaran',
        };
        getCategoryById.mockResolvedValue(existingCategory);
        updateCategory.mockResolvedValue(null);

        await expect(
          updateCategoryService(1, 1, 'Makanan', 'pengeluaran'),
        ).rejects.toThrow('Category gagal diupdate');
      });
    });
  });

  describe('DELETE CATEGORY SERVICE', () => {
    describe('Validation Tests', () => {
      test('should throw error if id_category is missing', async () => {
        await expect(deleteCategoryService(null, 1)).rejects.toThrow(
          'ID category tidak valid',
        );
      });

      test('should throw error if id_category is not a number', async () => {
        await expect(deleteCategoryService('abc', 1)).rejects.toThrow(
          'ID category tidak valid',
        );
      });

      test('should throw error if id_user is missing', async () => {
        await expect(deleteCategoryService(1, null)).rejects.toThrow(
          'User tidak ditemukan',
        );
      });
    });

    describe('Success and Not Found Tests', () => {
      test('should delete category successfully', async () => {
        const deletedCategory = {
          id_category: 1,
          nama_category: 'Makanan',
          tipe: 'pengeluaran',
        };
        deleteCategory.mockResolvedValue(deletedCategory);

        const result = await deleteCategoryService(1, 1);

        expect(result).toBeDefined();
        expect(result.id_category).toBe(1);
        expect(deleteCategory).toHaveBeenCalledWith(1, 1);
      });

      test('should throw error if category to delete not found', async () => {
        deleteCategory.mockResolvedValue(null);

        await expect(deleteCategoryService(999, 1)).rejects.toThrow(
          'Category tidak ditemukan atau sudah dihapus',
        );
      });

      test('should handle database error', async () => {
        deleteCategory.mockRejectedValue(new Error('Database error'));

        await expect(deleteCategoryService(1, 1)).rejects.toThrow(
          'Database error',
        );
      });
    });
  });
});
