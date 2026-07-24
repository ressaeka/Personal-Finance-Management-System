import prisma from "../config/prisma.js";

export const createCategory = (data) => {
  return prisma.category.create({
    data,
    select: {
      id: true,
      nameCategory: true,
      tipe: true,
      createdAt: true,
    },
  });
};

export const findCategoryById = (where) => {
  return prisma.category.findFirst({
    where,
    select: {
      id: true,
      nameCategory: true,
      tipe: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findAllCategory = ({ userId, skip, take }) => {
  return prisma.category.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      id: true,
      nameCategory: true,
      tipe: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take,
  });
};

export const countCategory = (userId) => {
  return prisma.category.count({
    where: {
      userId,
      isDeleted: false,
    },
  });
};

export const findCategoryByName = (userId, nameCategory) => {
  return prisma.category.findFirst({
    where: {
      userId,
      nameCategory,
      isDeleted: false,
    },
    select: {
      id: true,
      nameCategory: true,
      tipe: true,
    },
  });
};

// Cari termasuk yang sudah dihapus
export const findCategoryByNameIncludeDeleted = (userId, nameCategory) => {
  return prisma.category.findFirst({
    where: {
      userId,
      nameCategory,
    },
    select: {
      id: true,
      nameCategory: true,
      tipe: true,
      isDeleted: true,
    },
  });
};

// Restore kategori
export const restoreCategory = (id, tipe) => {
  return prisma.category.update({
    where: {
      id,
    },
    data: {
      tipe,
      isDeleted: false,
      deletedAt: null,
    },
    select: {
      id: true,
      nameCategory: true,
      tipe: true,
      updatedAt: true,
    },
  });
};

export const updateCategory = (id, userId, data) => {
  return prisma.category.update({
    where: {
      id,
      userId,
    },
    data,
    select: {
      id: true,
      nameCategory: true,
      tipe: true,
      updatedAt: true,
    },
  });
};

export const deleteCategory = (id, userId) => {
  return prisma.category.update({
    where: {
      id,
      userId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });
};