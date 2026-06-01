import { NextRequest, NextResponse } from "next/server";
import { isApiError } from "@/lib/db/errors";
import { getDatabaseConfigurationStatus, prisma } from "@/lib/db/prisma";
import { resolveAccessContextFromRequest, resolveUserContextFromRequest } from "@/lib/db/projects";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
 try {
 if (!getDatabaseConfigurationStatus().configured) {
 return NextResponse.json({
 status: "database_not_configured",
 auditLogs: [],
 message: "Configure DATABASE_URL to load audit logs.",
 });
 }

 const projectId = request.nextUrl.searchParams.get("projectId") || undefined;

 if (projectId) {
 const access = await resolveAccessContextFromRequest(request, {
 projectId,
 permission: "view_project",
 });

 const auditLogs = await prisma.auditLog.findMany({
 where: { projectId: access.project.id },
 orderBy: { createdAt: "desc" },
 take: 100,
 });

 return NextResponse.json({
 status: "project_audit_ready",
 mode: "project_chat",
 project: { id: access.project.id, name: access.project.name, role: access.membership.role },
 auditLogs,
 });
 }

 const userAccess = await resolveUserContextFromRequest(request);
 const auditLogs = await prisma.auditLog.findMany({
 where: { userId: userAccess.user.id, projectId: null },
 orderBy: { createdAt: "desc" },
 take: 100,
 });

 return NextResponse.json({
 status: "free_chat_audit_ready",
 mode: "free_chat",
 user: { id: userAccess.user.id, email: userAccess.user.email, name: userAccess.user.name },
 auditLogs,
 });
 } catch (error) {
 if (isApiError(error)) {
 return NextResponse.json(
 { status: "audit_error", code: error.code, error: error.message },
 { status: error.statusCode },
 );
 }

 return NextResponse.json(
 {
 status: "audit_error",
 error: error instanceof Error ? error.message : "Unknown audit API error",
 },
 { status: 500 },
 );
 }
}
