import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const truncateTables = async () => {
  console.log("Truncating tables...");

  console.log("Truncating table Access...");
  await prisma.$executeRaw`TRUNCATE TABLE "Access" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Invite...");
  await prisma.$executeRaw`TRUNCATE TABLE "Invite" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Workspace...");
  await prisma.$executeRaw`TRUNCATE TABLE "Workspace" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Collection...");
  await prisma.$executeRaw`TRUNCATE TABLE "Collection" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Version...");
  await prisma.$executeRaw`TRUNCATE TABLE "Version" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Resource...");
  await prisma.$executeRaw`TRUNCATE TABLE "Resource" RESTART IDENTITY CASCADE`;

  console.log("Truncating table _ResourceToVersion...");
  await prisma.$executeRaw`TRUNCATE TABLE "_ResourceToVersion" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Relation...");
  await prisma.$executeRaw`TRUNCATE TABLE "Relation" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Analytics...");
  await prisma.$executeRaw`TRUNCATE TABLE "Analytics" RESTART IDENTITY CASCADE`;

  console.log("Truncating table Notification...");
  await prisma.$executeRaw`TRUNCATE TABLE "Notification" RESTART IDENTITY CASCADE`;
};

await truncateTables();

process.exit(0);
