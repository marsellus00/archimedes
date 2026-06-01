import { type NextRequest } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { tryLogAuditEvent } from "@/lib/db/audit";
import { getDatabaseConfigurationStatus } from "@/lib/db/prisma";
import { prisma } from "@/lib/db/prisma";
import { toJsonSafe } from "@/lib/db/serialization";
import { resolveAccessContextFromRequest } from "@/lib/db/projects";
import type { CalculationResult } from "@/lib/calculations/common/resultTypes";

export type CalculationPersistenceStatus = {
 persisted: boolean;
 calculationId?: string;
 projectId?: string;
 auditLogged?: boolean;
 status: "database_persisted" | "database_not_configured";
};

export async function persistCalculationFromRequest(input: {
 request: NextRequest;
 body: Record<string, unknown>;
 result: CalculationResult;
}): Promise<CalculationPersistenceStatus> {
 if (!getDatabaseConfigurationStatus().configured) {
 return { persisted: false, status: "database_not_configured" };
 }

 const projectId =
 typeof input.body.projectId === "string" ? input.body.projectId : undefined;
 const access = await resolveAccessContextFromRequest(input.request, {
 projectId,
 permission: "run_calculation",
 });

 const calculation = await prisma.calculation.create({
 data: {
 projectId: access.project.id,
 userId: access.user.id,
 linkedChatMessageId:
 typeof input.body.linkedChatMessageId === "string"
 ? input.body.linkedChatMessageId
 : undefined,
 calculationType: input.result.calculationType,
 objective: input.result.objective,
 inputJson: toJsonSafe(input.result.inputs) as Prisma.InputJsonValue,
 resultJson: toJsonSafe(input.result) as Prisma.InputJsonValue,
 unitSystem: typeof input.body.unitSystem === "string" ? input.body.unitSystem : "SI",
 assumptionsJson: toJsonSafe(input.result.assumptions) as Prisma.InputJsonValue,
 warningsJson: toJsonSafe(input.result.warnings) as Prisma.InputJsonValue,
 limitationsJson: toJsonSafe(input.result.limitations) as Prisma.InputJsonValue,
 requiresProfessionalReview: input.result.requiresProfessionalReview,
 reviewStatus: input.result.requiresProfessionalReview ? "NEEDS_REVIEW" : "DRAFT",
 },
 });

 const audit = await tryLogAuditEvent({
 action: "calculation.performed",
 entityType: "calculation",
 entityId: calculation.id,
 userId: access.user.id,
 projectId: access.project.id,
 metadata: {
 calculationType: calculation.calculationType,
 requiresProfessionalReview: calculation.requiresProfessionalReview,
 },
 });

 return {
 persisted: true,
 calculationId: calculation.id,
 projectId: access.project.id,
 auditLogged: Boolean(audit),
 status: "database_persisted",
 };
}

export async function listRecentCalculations(projectId: string, limit = 10) {
 return prisma.calculation.findMany({
 where: { projectId },
 orderBy: { createdAt: "desc" },
 take: limit,
 });
}
