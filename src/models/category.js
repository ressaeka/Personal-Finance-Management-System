import prisma from "../config/prisma.js";

export const createCategory = async (id_user, nama_category, tipe) => {
  return prisma.category.create({
    data: { id_user, nama_category, tipe },
  });
};

export const getAllCategory = async (id_user) => {
  return prisma.category.findMany({
    where: { id_user, is_deleted: false },
    orderBy: { id_category: "asc" },
  });
};

export const getCategoryById = async (id_category, id_user) => {
  return prisma.category.findFirst({
    where: { id_category, id_user, is_deleted: false },
  });
};

export const updateCategory = async (id_category, id_user, nama_category, tipe) => {
  const existing = await prisma.category.findFirst({
    where: { id_category, id_user, is_deleted: false },
  });
  if (!existing) return null;

  return prisma.category.update({
    where: { id_category },
    data: { nama_category, tipe },
  });
};

export const deleteCategory = async (id_category, id_user) => {
  const existing = await prisma.category.findFirst({
    where: { id_category, id_user, is_deleted: false },
  });
  if (!existing) return null;

  return prisma.category.update({
    where: { id_category },
    data: { is_deleted: true, deleted_at: new Date() },
  });
};
