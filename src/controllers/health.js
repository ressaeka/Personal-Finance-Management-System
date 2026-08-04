import prisma from "../config/prisma.js";
import redis from "../config/redis.js";
import logger from "../config/logger.js";

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

export const healthCheck = async (req, res) => {
  const checks = { database: "down", redis: "down" };
  let healthy = true;

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 2000);
    checks.database = "up";
  } catch (err) {
    healthy = false;
    logger.error({ err }, "Database health check failed");  
  }

  if (redis) {
    try {
      await withTimeout(redis.ping(), 2000);
      checks.redis = "up";
    } catch (err) {
      healthy = false;
      logger.error({ err }, "Health check redis failed");
    }
  } else {
    checks.redis = "not configured";
  }

  const statusCode = healthy ? 200 : 503;
  return res.status(statusCode).json({
    status: healthy ? "ok" : "degraded",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    checks,
    timestamp: new Date().toISOString(),
  });
};
