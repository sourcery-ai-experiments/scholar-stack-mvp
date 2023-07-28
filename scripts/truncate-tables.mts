import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const truncateTables = async () => {
  console.log("Truncating tables...");

  console.log("Truncating table Link...");
  await prisma.$executeRaw`TRUNCATE TABLE "Link" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Version...");
  await prisma.$executeRaw`TRUNCATE TABLE "Version" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Project...");
  await prisma.$executeRaw`TRUNCATE TABLE "Project" RESTART IDENTITY CASCADE`;

  console.log("Truncating table _LinkToVersion...");
  await prisma.$executeRaw`TRUNCATE TABLE "_LinkToVersion" RESTART IDENTITY CASCADE`;
};

await truncateTables();

process.exit(0);
