import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "";

const prismaClientSingleton = () => {
  // DATABASE_URL points at Supabase's PgBouncer pooler (port 6543,
  // pgbouncer=true), which multiplexes far more than a handful of client
  // connections — `max` here only bounds how many connections *this
  // process* opens to the pooler, not the Postgres backend, so a low value
  // (previously 2) needlessly serialized concurrent queries from the same
  // process.
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000
  });

  pool.on("error", (err) => {
    console.error("[prisma/pg-pool] Unexpected error on idle client", err);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    // With driver adapters, a query with several `include`d relations (e.g.
    // getEventBySlug's author/sponsorships/organizers/gallery/tags) runs as
    // an implicit interactive transaction — one round-trip per relation. Over
    // a remote pooler this routinely took 6-7s in practice, blowing past
    // Prisma's 5000ms default itx timeout (P2028) and making real records
    // silently render as 404 (handleErrorServerNoAuth swallows the error).
    transactionOptions: { timeout: 20_000, maxWait: 10_000 }
  });
};

const prismaGlobal = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = prismaGlobal.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}

export { prisma };
