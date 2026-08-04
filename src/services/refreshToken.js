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

const userTokensKey = (userId) => `user_tokens:${userId}`;

export const setRefreshToken = async (userId, refreshToken) => {
  if (!redis || isTest) return;
  try {
    const multi = redis.multi();
    multi.set(`refresh_token:${refreshToken}`, String(userId), "EX", 7 * 24 * 60 * 60);
    multi.sadd(userTokensKey(userId), refreshToken);
    multi.expire(userTokensKey(userId), 7 * 24 * 60 * 60);
    await multi.exec();
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
    const userId = await redis.get(`refresh_token:${refreshToken}`);
    if (!userId) return;
    const multi = redis.multi();
    multi.del(`refresh_token:${refreshToken}`);
    multi.srem(userTokensKey(userId), refreshToken);
    await multi.exec();
  } catch (err) {
    console.error("Redis unavailable (deleteRefreshToken):", err.message);
  }
};

export const revokeAllUserTokens = async (userId) => {
  if (!redis || isTest) return;
  try {
    const tokens = await redis.smembers(userTokensKey(userId));
    if (!tokens || tokens.length === 0) return;

    const multi = redis.multi();
    for (const token of tokens) {
      multi.del(`refresh_token:${token}`);
    }
    multi.del(userTokensKey(userId));
    await multi.exec();
  } catch (err) {
    console.error("Redis unavailable (revokeAllUserTokens):", err.message);
  }
};

export const disconnectRedis = async () => {
  if (redis && !isTest) {
    await redis.quit();
  }
};
