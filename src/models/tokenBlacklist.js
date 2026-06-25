import prisma from "../config/prisma.js";

export const addToBlacklist = async (jti) => {
  return prisma.token_blacklist.create({ data: { jti } });
};

export const isBlacklisted = async (jti) => {
  const found = await prisma.token_blacklist.findUnique({ where: { jti } });
  return !!found;
};
