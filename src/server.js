import app from "./app.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Process terminated.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);