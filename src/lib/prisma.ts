import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { 
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
};

let prismaClient: PrismaClient;

if (typeof window === "undefined") {
  if (!globalForPrisma.prisma) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma.pgPool = pool;
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  prismaClient = globalForPrisma.prisma;
} else {
  // Safe fallback for client side bundle imports
  prismaClient = null as any;
}

export const prisma = prismaClient;
