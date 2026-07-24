import prisma from "../config/prisma.js";


export const createTransaksi = (data) => {
  return prisma.transaksi.create({
    data,
    select: {
      id: true,
      jumlah: true,
      deskripsi: true,
      tanggal: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          nameCategory: true,
          tipe: true,
        },
      },
    },
  });
};


export const findTransaksiById = (where) => {
  return prisma.transaksi.findFirst({
    where,
    select: {
      id: true,
      jumlah: true,
      deskripsi: true,
      tanggal: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          nameCategory: true,
          tipe: true,
        },
      },
    },
  });
};


export const findAllTransaksi = ({ userId, skip, take }) => {
  return prisma.transaksi.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      id: true,
      jumlah: true,
      deskripsi: true,
      tanggal: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          nameCategory: true,
          tipe: true,
        },
      },
    },
    orderBy: [
      {
        tanggal: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    skip,
    take,
  });
};


export const countTransaksi = (userId) => {
  return prisma.transaksi.count({
    where: {
      userId,
      isDeleted: false,
    },
  });
};


export const updateTransaksi = (id, userId, data) => {
  return prisma.transaksi.update({
    where: {
      id,
      userId,
    },
    data,
    select: {
      id: true,
      jumlah: true,
      deskripsi: true,
      tanggal: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          nameCategory: true,
          tipe: true,
        },
      },
    },
  });
};


export const deleteTransaksi = (id, userId) => {
  return prisma.transaksi.update({
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