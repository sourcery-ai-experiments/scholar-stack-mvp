import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const truncateTables = async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "Link" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Version" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Project" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "_LinkToVersion" RESTART IDENTITY CASCADE`;
};

await truncateTables();

process.exit(0);
