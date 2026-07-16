import prisma from "../config/prisma.js";

export const createTransaksi = async (data) => {
  return await prisma.transaksi.create({
    data,
  });
};

export const getAllTransaksi = async (id_user) => {
  return await prisma.transaksi.findMany({
    where: {
      id_user,
      is_deleted: false,
    },
    include: {
      category: true,
    },
    orderBy: [
      {
        tanggal: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
};

export const getTransaksiById = async (id_transaksi, id_user) => {
  return await prisma.transaksi.findFirst({
    where: {
      id_transaksi,
      id_user,
      is_deleted: false,
    },
    include: {
      category: true,
    },
  });
};

export const updateTransaksi = async (id_transaksi, data) => {
  return await prisma.transaksi.update({
    where: {
      id_transaksi,
    },
    data,
  });
};

export const deleteTransaksi = async (id_transaksi) => {
  return await prisma.transaksi.update({
    where: {
      id_transaksi,
    },
    data: {
      is_deleted: true,
      deletedAt: new Date(),
    },
  });
};