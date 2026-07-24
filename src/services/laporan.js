import {
  findTransactions,
  countTransactions,
  aggregateTransactions,
  groupByCategory,
} from "../repositories/laporan.js";

import { AppError } from "../utils/appError.js";

export const getLaporanService = async (
  userId,
  {
    categoryId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    tipe,
  }
) => {
  if (!userId) {
    throw new AppError("User tidak ditemukan", 401);
  }

  const where = {
    userId,
    isDeleted: false,
  };

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  if (tipe) {
    where.category = {
      tipe: tipe,
    };
  }

  if (startDate && endDate) {
    where.tanggal = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const skip = (page - 1) * limit;

  const [
    transactions,
    totalData,
    summary,
    categorySummary,
  ] = await Promise.all([
    findTransactions({
      where,
      skip,
      take: Number(limit),
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
      page: Number(page),
      limit: Number(limit),
      totalData,
      totalPage: Math.ceil(totalData / limit),
    },

    transactions,
  };
};