import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // Fluid Compute: a single warm instance handles many concurrent requests,
  // so the pg pool needs more headroom than the default (10). 20 matches
  // the recommended Fluid concurrency / Neon free-tier ceiling.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: 20,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
