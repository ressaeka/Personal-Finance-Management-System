import app from "./app.js";
import prisma from "./config/prisma.js";

const port = process.env.PORT || 3000;
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

const server = app.listen(port, host, () => {
  console.log(`Server is running http://${host}:${port}`)
})

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});





