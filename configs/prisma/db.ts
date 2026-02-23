import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const prismaGlobal = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton>;
};

const prisma = prismaGlobal.prisma ?? prismaClientSingleton();

prismaGlobal.prisma = prisma;

export { prisma };
