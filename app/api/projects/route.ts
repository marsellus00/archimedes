import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConfigurationStatus } from "@/lib/db/prisma";
import { isApiError } from "@/lib/db/errors";
import { createProjectForRequest, listProjectsForRequest } from "@/lib/db/projects";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!getDatabaseConfigurationStatus().configured) {
      return NextResponse.json(
        {
          status: "phase_5_database_not_configured",
          message: "Configure DATABASE_URL to list database-backed projects.",
        },
        { status: 503 },
      );
    }

    const memberships = await listProjectsForRequest(request);

    return NextResponse.json({
      status: "phase_5_projects_ready",
      projects: memberships.map((membership: any) => ({
        id: membership.project.id,
        name: membership.project.name,
        description: membership.project.description,
        discipline: membership.project.discipline,
        jurisdiction: membership.project.jurisdiction,
        status: membership.project.status,
        role: membership.role,
        organization: membership.project.organization
          ? {
              id: membership.project.organization.id,
              name: membership.project.organization.name,
            }
          : undefined,
        createdAt: membership.project.createdAt,
        updatedAt: membership.project.updatedAt,
      })),
    });
  } catch (error) {
    return handleProjectApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!getDatabaseConfigurationStatus().configured) {
      return NextResponse.json(
        {
          status: "phase_5_database_not_configured",
          message: "Configure DATABASE_URL to create database-backed projects.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      discipline?: string;
      jurisdiction?: string;
      organizationName?: string;
    };

    const project = await createProjectForRequest(request, body);

    return NextResponse.json({
      status: "phase_5_project_created",
      project,
    });
  } catch (error) {
    return handleProjectApiError(error);
  }
}

function handleProjectApiError(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      { status: "phase_5_project_error", code: error.code, error: error.message },
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    {
      status: "phase_5_project_error",
      error: error instanceof Error ? error.message : "Unknown project API error",
    },
    { status: 500 },
  );
}
