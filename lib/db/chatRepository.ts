import { type ChatMessageRole, Prisma } from "@/lib/generated/prisma/client";
import { tryLogAuditEvent } from "@/lib/db/audit";
import { ApiError } from "@/lib/db/errors";
import { prisma } from "@/lib/db/prisma";
import { toJsonSafe } from "@/lib/db/serialization";
import { type ProjectAccessContext, type UserAccessContext } from "@/lib/db/projects";
import type { EngineeringAIResponseEnvelope, EngineeringChatMode } from "@/lib/ai/types";

export type ChatAccessContext =
  | ({ mode: "project_chat" } & ProjectAccessContext)
  | ({ mode: "free_chat" } & UserAccessContext);

function isProjectChat(access: ChatAccessContext): access is { mode: "project_chat" } & ProjectAccessContext {
  return access.mode === "project_chat";
}

export async function getOrCreateChatSession(
  access: ChatAccessContext,
  options: { sessionId?: string; titleSeed?: string },
) {
  if (options.sessionId) {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: options.sessionId,
        userId: access.user.id,
        ...(isProjectChat(access)
          ? { projectId: access.project.id, mode: "PROJECT_CHAT" }
          : { projectId: null, mode: "FREE_CHAT" }),
      },
    });

    if (!session) {
      throw new ApiError(
        404,
        isProjectChat(access)
          ? "Chat session was not found in this project."
          : "Free chat session was not found for this user.",
        "chat_session_not_found",
      );
    }

    return session;
  }

  return prisma.chatSession.create({
    data: {
      projectId: isProjectChat(access) ? access.project.id : undefined,
      userId: access.user.id,
      title: makeChatTitle(options.titleSeed),
      mode: isProjectChat(access) ? "PROJECT_CHAT" : "FREE_CHAT",
      metadataJson: toJsonSafe({
        createdBy: "phase_5_chat_endpoint",
        chatMode: isProjectChat(access) ? "project_chat" : "free_chat",
      }),
    },
  });
}

export async function saveChatMessage(input: {
  access: ChatAccessContext;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const message = await prisma.chatMessage.create({
    data: {
      chatSessionId: input.sessionId,
      projectId: isProjectChat(input.access) ? input.access.project.id : undefined,
      userId: input.role === "ASSISTANT" ? undefined : input.access.user.id,
      role: input.role,
      content: input.content,
      metadataJson: input.metadata ?? {},
    },
  });

  await prisma.chatSession.update({
    where: { id: input.sessionId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export async function persistChatExchange(input: {
  access: ChatAccessContext;
  sessionId?: string;
  userMessage: string;
  envelope: EngineeringAIResponseEnvelope;
}) {
  const session = await getOrCreateChatSession(input.access, {
    sessionId: input.sessionId,
    titleSeed: input.userMessage,
  });

  const userMessage = await saveChatMessage({
    access: input.access,
    sessionId: session.id,
    role: "USER",
    content: input.userMessage,
    metadata: toJsonSafe({ requestContext: input.envelope.requestContext }),
  });

  const assistantMessage = await saveChatMessage({
    access: input.access,
    sessionId: session.id,
    role: "ASSISTANT",
    content: input.envelope.response.answer,
    metadata: toJsonSafe({
      classification: input.envelope.classification,
      provider: input.envelope.provider,
      response: input.envelope.response,
      implementationStatus: input.envelope.implementationStatus,
      warnings: input.envelope.warnings,
    }),
  });

  await tryLogAuditEvent({
    action: isProjectChat(input.access)
      ? "chat.project_response_generated"
      : "chat.free_response_generated",
    entityType: "chat_session",
    entityId: session.id,
    userId: input.access.user.id,
    projectId: isProjectChat(input.access) ? input.access.project.id : undefined,
    metadata: {
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
      classification: input.envelope.classification.category,
      chatMode: isProjectChat(input.access) ? "project_chat" : "free_chat",
    },
  });

  return { session, userMessage, assistantMessage };
}

export async function listRecentProjectChatSessions(projectId: string, limit = 10) {
  return prisma.chatSession.findMany({
    where: { projectId, mode: "PROJECT_CHAT" },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function listRecentFreeChatSessions(userId: string, limit = 10) {
  return prisma.chatSession.findMany({
    where: { userId, projectId: null, mode: "FREE_CHAT" },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function listRecentChatSessions(projectId: string, limit = 10) {
  return listRecentProjectChatSessions(projectId, limit);
}

export function resolveChatMode(projectId?: string | null, requestedMode?: EngineeringChatMode): EngineeringChatMode {
  if (projectId) return "project_chat";
  if (requestedMode === "project_chat") return "project_chat";
  return "free_chat";
}

function makeChatTitle(seed?: string) {
  const normalized = seed?.replace(/\s+/g, " ").trim();
  if (!normalized) return "Engineering Chat";
  return normalized.length > 72 ? `${normalized.slice(0, 69)}...` : normalized;
}
