import dotenv from "dotenv";
import pkg from "@prisma/client";

dotenv.config(); // load env BEFORE using Prisma

const { PrismaClient } = pkg;

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // optional but safe
});