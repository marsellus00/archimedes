import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
 engineeringPrisma?: PrismaClient;
};

function createPrismaClient() {
 const connectionString = process.env.DATABASE_URL?.trim();

 if (!connectionString) {
 throw new Error(
 "DATABASE_URL is required before the database layer can be used.",
 );
 }

 const adapter = new PrismaPg({ connectionString });

 return new PrismaClient({
 adapter,
 log:
 process.env.NODE_ENV === "development"
 ? ["warn", "error"]
 : ["error"],
 });
}

export function getDatabaseConfigurationStatus() {
 return {
 configured: Boolean(process.env.DATABASE_URL?.trim()),
 provider: "postgresql",
 orm: "prisma",
 requiresPgVector: true,
 };
}

export function getPrismaClient() {
 if (!globalForPrisma.engineeringPrisma) {
 globalForPrisma.engineeringPrisma = createPrismaClient();
 }

 return globalForPrisma.engineeringPrisma;
}

export const prisma = new Proxy({} as PrismaClient, {
 get(_target, property, receiver) {
 return Reflect.get(getPrismaClient(), property, receiver);
 },
});
