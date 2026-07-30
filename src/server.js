import app from "./app.js";
import prisma from "./config/prisma.js";
import { disconnectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down gracefully...");

  server.close(async () => {
    try {
      await Promise.all([prisma.$disconnect(), disconnectRedis()]);
      console.log("Connections closed.");
      process.exit(0);
    } catch (err) {
      console.error("Shutdown failed:", err);
      process.exit(1);
    }
  });
};


process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);