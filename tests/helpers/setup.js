import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { execSync } from "node:child_process";
import app from "../../src/app.js";

const databaseUrl = process.env.DATABASE_URL_TEST;

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
  execSync("npx prisma db push --force-reset", {
    env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: "test" },
    stdio: "pipe",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma, app };
