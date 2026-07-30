import Redis from "ioredis";

const isTest = process.env.NODE_ENV === "test";

let redis;

if (!isTest) {
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on("connect", () => {
    console.log("Redis Connected");
  });

  redis.on("error", (err) => {
    console.error("Redis Error:", err.message);
  });
}

export const disconnectRedis = async () => {
  if (redis && !isTest) {
    try {
      await redis.quit();
    } catch (err) {
      console.error("Redis disconnect error:", err.message);
    }
  }
};

export default redis;
