import { prisma } from "@/lib/db/prisma";
import { toJsonSafe } from "@/lib/db/serialization";

export type AuditEventInput = {
 action: string;
 entityType: string;
 entityId?: string | null;
 userId?: string | null;
 projectId?: string | null;
 metadata?: unknown;
};

export async function logAuditEvent(input: AuditEventInput) {
 return prisma.auditLog.create({
 data: {
 action: input.action,
 entityType: input.entityType,
 entityId: input.entityId ?? null,
 userId: input.userId ?? null,
 projectId: input.projectId ?? null,
 metadataJson: toJsonSafe(input.metadata ?? {}),
 },
 });
}

export async function tryLogAuditEvent(input: AuditEventInput) {
 try {
 return await logAuditEvent(input);
 } catch (error) {
 console.warn("Audit log write failed", error);
 return null;
 }
}