import prisma from "../config/prisma.js";

export const createTransaksi = async (id_user, id_category, jumlah, deskripsi, tanggal) => {
  return prisma.transaksi.create({
    data: {
      id_user,
      id_category,
      jumlah,
      deskripsi,
      tanggal,
    },
    include: {
      category: { select: { nama_category: true, tipe: true } },
    },
  });
};

export const getAllTransaksi = async (id_user) => {
  return prisma.transaksi.findMany({
    where: { id_user, is_deleted: false },
    include: {
      category: { select: { nama_category: true, tipe: true } },
    },
    orderBy: [{ tanggal: "desc" }, { created_at: "desc" }],
  });
};

export const getTransaksiById = async (id_transaksi, id_user) => {
  return prisma.transaksi.findFirst({
    where: { id_transaksi, id_user, is_deleted: false },
    include: {
      category: { select: { nama_category: true, tipe: true } },
    },
  });
};

export const updateTransaksi = async (id_transaksi, id_user, id_category, jumlah, deskripsi, tanggal) => {
  const existing = await prisma.transaksi.findFirst({
    where: { id_transaksi, id_user, is_deleted: false },
  });
  if (!existing) return null;

  return prisma.transaksi.update({
    where: { id_transaksi },
    data: {
      id_category,
      jumlah,
      deskripsi,
      tanggal,
    },
  });
};

export const deleteTransaksi = async (id_transaksi, id_user) => {
  const existing = await prisma.transaksi.findFirst({
    where: { id_transaksi, id_user, is_deleted: false },
  });
  if (!existing) return null;

  return prisma.transaksi.update({
    where: { id_transaksi },
    data: { is_deleted: true, deleted_at: new Date() },
  });
};
