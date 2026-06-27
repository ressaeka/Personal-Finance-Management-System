import prisma from "../config/prisma.js";

export const createUsers = async ({ username, email, password }) => {
  return prisma.users.create({
    data: { username, email, password },
    select: { id_user: true, username: true, email: true, created_at: true, updated_at: true },
  });
};

export const findUserByUsername = async (username) => {
  return prisma.users.findUnique({
    where: { username },
  });
};

export const findUserByEmail = async (email) => {
  return prisma.users.findUnique({
    where: { email },
  });
};

export const findUserById = async (id_user) => {
  return prisma.users.findUnique({
    where: { id_user },
  });
};

export const updateUserById = async (id_user, username, email, password) => {
  return prisma.users.update({
    where: { id_user },
    data: { username, email, password },
    select: { id_user: true, username: true, email: true, updated_at: true },
  });
};


