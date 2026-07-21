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


export const findCategoryByName = ( userId, nameCategory ) => {
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


export const updateCategory = (id, data) => {
  return prisma.category.update({
    where: {
      id,
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


export const deleteCategory = (id) => {
  return prisma.category.update({
    where: {
      id,
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