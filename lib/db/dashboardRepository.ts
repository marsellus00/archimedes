import { prisma } from "@/lib/db/prisma";
import { listRecentCalculations } from "@/lib/db/calculationRepository";
import { listRecentChatSessions } from "@/lib/db/chatRepository";

export async function buildProjectDashboard(projectId: string) {
 const [
 calculationCount,
 chatSessionCount,
 uploadedFileCount,
 safetyCriticalCount,
 recentCalculations,
 recentChats,
 recentAudit,
 ] = await Promise.all([
 prisma.calculation.count({ where: { projectId } }),
 prisma.chatSession.count({ where: { projectId } }),
 prisma.uploadedFile.count({ where: { projectId } }),
 prisma.calculation.count({
 where: { projectId, requiresProfessionalReview: true },
 }),
 listRecentCalculations(projectId, 6),
 listRecentChatSessions(projectId, 6),
 prisma.auditLog.findMany({
 where: { projectId },
 orderBy: { createdAt: "desc" },
 take: 8,
 }),
 ]);

 return {
 counts: {
 calculations: calculationCount,
 chats: chatSessionCount,
 uploadedFiles: uploadedFileCount,
 safetyCriticalItems: safetyCriticalCount,
 },
 recentCalculations,
 recentChats,
 recentAudit,
 };
}
