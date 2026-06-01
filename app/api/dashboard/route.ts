import { NextRequest, NextResponse } from "next/server";
import { buildProjectDashboard } from "@/lib/db/dashboardRepository";
import { getDatabaseConfigurationStatus } from "@/lib/db/prisma";
import { isApiError } from "@/lib/db/errors";
import { resolveAccessContextFromRequest } from "@/lib/db/projects";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
 try {
 if (!getDatabaseConfigurationStatus().configured) {
 return NextResponse.json({
 status: "database_not_configured",
 dashboard: null,
 message: "Configure DATABASE_URL to load live dashboard data.",
 });
 }

 const projectId = request.nextUrl.searchParams.get("projectId") || undefined;
 const access = await resolveAccessContextFromRequest(request, {
 projectId,
 permission: "view_project",
 });
 const dashboard = await buildProjectDashboard(access.project.id);

 return NextResponse.json({
 status: "dashboard_ready",
 project: {
 id: access.project.id,
 name: access.project.name,
 discipline: access.project.discipline,
 role: access.membership.role,
 },
 dashboard,
 });
 } catch (error) {
 if (isApiError(error)) {
 return NextResponse.json(
 { status: "dashboard_error", code: error.code, error: error.message },
 { status: error.statusCode },
 );
 }

 return NextResponse.json(
 {
 status: "dashboard_error",
 error: error instanceof Error ? error.message : "Unknown dashboard API error",
 },
 { status: 500 },
 );
 }
}
