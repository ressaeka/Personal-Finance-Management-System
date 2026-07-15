import prisma from "../config/prisma.js";

export const createCategory = (data) => {
  return prisma.category.create({
    data,
  });
};

export const findCategoryById = (id) => {
    return prisma.category.findUnique ({
        where : {
            id,
        }
    })
}

export const findAllCategory = (userId) => {
  return prisma.category.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findCategoryByName  = (userId, nameCategory) => {
    return prisma.category.findUnique ({
        where : {
            userId,
            nameCategory,
            isDeleted : false,
        }
    })
}

export const updateCategory = (id, data) => {
    return prisma.category.update ({
        where : {
            id,
        }, 
        data,
    })
}

export const deleteCategory = (id) => {
  return prisma.category.update ({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};