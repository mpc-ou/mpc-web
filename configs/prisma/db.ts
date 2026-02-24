import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "";

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on("error", (err) => {
    console.error("[prisma/pg-pool] Unexpected error on idle client", err);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const prismaGlobal = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = prismaGlobal.prisma ?? prismaClientSingleton();

// In development, preserve the client across HMR (hot-module-reload).
// In production (long-running server / standalone), the module-level
// `prisma` variable already acts as a singleton.
if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}

export { prisma };
