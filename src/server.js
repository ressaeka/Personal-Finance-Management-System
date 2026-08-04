import app from "./app.js";
import prisma from "./config/prisma.js";
import redis, { disconnectRedis } from "./config/redis.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect Redis (karena lazyConnect)
    if (redis) {
      await redis.connect();
    }

    // Cek koneksi database
    await prisma.$connect();

    const server = app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${PORT}`);
    });

    const shutdown = async () => {
      logger.info("Shutting down gracefully...");

      server.close(async () => {
        try {
          await Promise.all([prisma.$disconnect(), disconnectRedis()]);

          logger.info("All connections closed.");
          process.exit(0);
        } catch (err) {
          logger.error({ err }, "Shutdown failed");
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    logger.fatal({ err }, "Application failed to start");
    process.exit(1);
  }
}

startServer();
