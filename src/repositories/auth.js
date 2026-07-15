import prisma from "../config/prisma.js";

export const createUser = (data) => {
  return prisma.user.create({
    data,
  });
};

export const findUserById = (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

export const findUserByUsername = (username) => {
  return prisma.user.findUnique({
    where: {
      username,
    },
  });
};

export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const updateUserById = (id, data) => {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
};