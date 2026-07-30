import redis from "../config/redis.js";
import { verifyRefreshToken } from "../utils/jwt.js";

const isTest = process.env.NODE_ENV === "test";

const decodeFallback = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    return String(decoded.id);
  } catch {
    return null;
  }
};

export const setRefreshToken = async (userId, refreshToken) => {
  if (!redis || isTest) return;
  try {
    await redis.set(
      `refresh_token:${refreshToken}`,
      String(userId),
      "EX",
      7 * 24 * 60 * 60
    );
  } catch (err) {
    console.error("Redis unavailable (setRefreshToken):", err.message);
  }
};

export const getRefreshToken = async (refreshToken) => {
  if (!redis || isTest) return decodeFallback(refreshToken);
  try {
    return await redis.get(`refresh_token:${refreshToken}`);
  } catch (err) {
    console.error("Redis unavailable (getRefreshToken):", err.message);
    return decodeFallback(refreshToken);
  }
};

export const deleteRefreshToken = async (refreshToken) => {
  if (!redis || isTest) return;
  try {
    await redis.del(`refresh_token:${refreshToken}`);
  } catch (err) {
    console.error("Redis unavailable (deleteRefreshToken):", err.message);
  }
};

export const disconnectRedis = async () => {
  if (redis && !isTest) {
    await redis.quit();
  }
};
