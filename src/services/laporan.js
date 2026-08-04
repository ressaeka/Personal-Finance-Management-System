import {
  findTransactions,
  countTransactions,
  aggregateTransactions,
  groupByCategory,
} from "../repositories/laporan.js";
import { AppError } from "../utils/appError.js";

export const getLaporanService = async (
  userId,
  { categoryId, startDate, endDate, page = 1, limit = 10, tipe } = {},
) => {
  if (!userId) {
    throw new AppError("User tidak ditemukan", 401);
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.max(1, Number(limit) || 10);
  const skip = (pageNumber - 1) * limitNumber;

  const where = {
    userId,
    isDeleted: false,
  };

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  if (tipe) {
    where.category = {
      tipe,
    };
  }

  if (startDate || endDate) {
    where.tanggal = {};

    if (startDate) {
      where.tanggal.gte = new Date(startDate);
    }

    if (endDate) {
      where.tanggal.lte = new Date(endDate);
    }
  }

  const [transactions, totalData, summary, categorySummary] = await Promise.all([
    findTransactions({
      where,
      skip,
      take: limitNumber,
    }),

    countTransactions(where),

    aggregateTransactions(where),

    groupByCategory(where),
  ]);

  return {
    summary: {
      totalTransactions: summary._count.id,
      totalAmount: summary._sum.jumlah ?? 0,
      averageAmount: summary._avg.jumlah ?? 0,
      highestTransaction: summary._max.jumlah ?? 0,
      lowestTransaction: summary._min.jumlah ?? 0,
    },

    categorySummary,

    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalData,
      totalPages: Math.ceil(totalData / limitNumber),
    },

    transactions,
  };
};
