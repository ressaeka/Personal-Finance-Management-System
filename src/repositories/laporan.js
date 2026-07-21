import prisma from "../config/prisma.js";


export const findTransactions = ({ where, skip, take }) => {
    return prisma.transaksi.findMany({
        where,
        include: {
            category:{
                select: {
                    id : true,
                    nameCategory: true,
                    tipe:true
                }
            }
        },
        orderBy:{
            tanggal:"desc",
        },
        skip, 
        take,
    })
}


export const countTransactions = (where) => {
    return prisma.transaksi.count({
        where,
    })
}

export const aggregateTransactions = (where) => {
  return prisma.transaksi.aggregate({
    where,
    _count: {
      id: true,
    },
    _sum: {
      jumlah: true,
    },
    _avg: {
      jumlah: true,
    },
    _max: {
      jumlah: true,
    },
    _min: {
      jumlah: true,
    },
  });
};

export const groupByCategory = (where) => {
  return prisma.transaksi.groupBy({
    by: ["categoryId"],
    where,
    _count: {
      id: true,
    },
    _sum: {
      jumlah: true,
    },
    orderBy: {
      _sum: {
        jumlah: "desc",
      },
    },
  });
};

