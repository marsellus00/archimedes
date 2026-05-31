import { NextRequest, NextResponse } from "next/server";
import { isApiError } from "@/lib/db/errors";
import { getDatabaseConfigurationStatus, prisma } from "@/lib/db/prisma";
import { resolveAccessContextFromRequest, resolveUserContextFromRequest } from "@/lib/db/projects";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!getDatabaseConfigurationStatus().configured) {
      return NextResponse.json({
        status: "phase_5_database_not_configured",
        history: null,
        message: "Configure DATABASE_URL to load chat or project history.",
      });
    }

    const projectId = request.nextUrl.searchParams.get("projectId") || undefined;
    const sessionId = request.nextUrl.searchParams.get("sessionId") || undefined;

    if (sessionId) {
      if (projectId) {
        const access = await resolveAccessContextFromRequest(request, {
          projectId,
          permission: "view_project",
        });

        const session = await prisma.chatSession.findFirst({
          where: {
            id: sessionId,
            userId: access.user.id,
            projectId: access.project.id,
            mode: "PROJECT_CHAT",
          },
          include: { messages: { orderBy: { createdAt: "asc" } } },
        });

        if (!session) {
          return NextResponse.json(
            { status: "phase_5_history_error", error: "Chat session was not found in this project." },
            { status: 404 },
          );
        }

        return NextResponse.json({
          status: "phase_5_chat_session_ready",
          mode: "project_chat",
          project: { id: access.project.id, name: access.project.name, role: access.membership.role },
          session,
        });
      }

      const userAccess = await resolveUserContextFromRequest(request);
      const session = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: userAccess.user.id,
          projectId: null,
          mode: "FREE_CHAT",
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (!session) {
        return NextResponse.json(
          { status: "phase_5_history_error", error: "Free chat session was not found for this user." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        status: "phase_5_chat_session_ready",
        mode: "free_chat",
        user: { id: userAccess.user.id, email: userAccess.user.email, name: userAccess.user.name },
        session,
      });
    }

    if (projectId) {
      const access = await resolveAccessContextFromRequest(request, {
        projectId,
        permission: "view_project",
      });

      const [calculations, chatSessions, auditLogs] = await Promise.all([
        prisma.calculation.findMany({
          where: { projectId: access.project.id },
          orderBy: { createdAt: "desc" },
          take: 25,
        }),
        prisma.chatSession.findMany({
          where: { projectId: access.project.id, mode: "PROJECT_CHAT" },
          orderBy: { updatedAt: "desc" },
          take: 25,
          include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
        }),
        prisma.auditLog.findMany({
          where: { projectId: access.project.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ]);

      return NextResponse.json({
        status: "phase_5_project_history_ready",
        mode: "project_chat",
        project: { id: access.project.id, name: access.project.name, role: access.membership.role },
        history: { calculations, chatSessions, auditLogs },
      });
    }

    const userAccess = await resolveUserContextFromRequest(request);
    const [freeChatSessions, freeAuditLogs] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId: userAccess.user.id, projectId: null, mode: "FREE_CHAT" },
        orderBy: { updatedAt: "desc" },
        take: 25,
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
      prisma.auditLog.findMany({
        where: { userId: userAccess.user.id, projectId: null },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      status: "phase_5_free_chat_history_ready",
      mode: "free_chat",
      user: { id: userAccess.user.id, email: userAccess.user.email, name: userAccess.user.name },
      history: {
        calculations: [],
        chatSessions: freeChatSessions,
        auditLogs: freeAuditLogs,
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(
        { status: "phase_5_history_error", code: error.code, error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        status: "phase_5_history_error",
        error: error instanceof Error ? error.message : "Unknown history API error",
      },
      { status: 500 },
    );
  }
}
