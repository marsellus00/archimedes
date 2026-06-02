import { NextRequest, NextResponse } from "next/server";
import {
 buildEngineeringInstructionHierarchy,
 summarizeInstructionHierarchy,
} from "@/lib/ai/instructionHierarchy";
import {
 createNeedsClarificationResponse,
 createOutOfScopeResponse,
} from "@/lib/ai/responseContract";
import { generateEngineeringResponseWithProvider, getConfiguredAIProvider } from "@/lib/ai/provider";
import type {
 EngineeringAIProviderResult,
 EngineeringAIResponseEnvelope,
 EngineeringChatMode,
 EngineeringChatRequest,
 EngineeringPromptInput,
 EngineeringRequestContext,
} from "@/lib/ai/types";
import { assertValidEngineeringAIResponse } from "@/lib/validation/engineeringResponse";
import { classifyEngineeringRequest } from "@/lib/safety/engineeringScope";
import { getDatabaseConfigurationStatus } from "@/lib/db/prisma";
import { isApiError } from "@/lib/db/errors";
import { type ChatAccessContext, persistChatExchange } from "@/lib/db/chatRepository";
import {
 type ProjectAccessContext,
 resolveAccessContextFromRequest,
 resolveUserContextFromRequest,
} from "@/lib/db/projects";

export const runtime = "nodejs";

export async function GET() {
 const { provider, selectionWarnings } = getConfiguredAIProvider();
 const database = getDatabaseConfigurationStatus();

 return NextResponse.json({
 status: "free_chat_ready",
 message:
 "The chat route applies Base.txt, uses the configured AI provider, supports user-scoped free chats, enforces project access only when a projectId is supplied, and persists chat sessions/messages with audit metadata when DATABASE_URL is configured.",
 provider: provider.info,
 database,
 selectionWarnings,
 chatModes: {
 freeChat:
 "Default mode. Creates user-scoped ChatSession records without requiring a Project.",
 projectChat:
 "Activated only when projectId is supplied. Requires project membership and write_chat permission.",
 },
 safeBoundary: [
 "Production authentication should be handled by the selected authentication provider; this route consumes trusted auth context or local dev headers.",
 "Project authorization is enforced only for project-backed resources.",
 "Free chats are user-scoped and do not unlock project files, calculations, document retrieval, or project audit data.",
 "Document retrieval is planned as a separate pipeline; file and chunk tables are already included in the schema.",
 ],
 });
}

export async function POST(request: NextRequest) {
 try {
 const chatRequest = await parseEngineeringChatRequest(request);

 if (!chatRequest.userMessage.trim()) {
 return NextResponse.json(
 {
 error: "userMessage is required",
 status: "free_chat_ready",
 },
 { status: 400 },
 );
 }

 const database = getDatabaseConfigurationStatus();
 const requireDatabase =
 process.env.REQUIRE_DATABASE === "true" || process.env.NODE_ENV === "production";
 const requestedProjectId = resolveRequestedProjectId(chatRequest);
 const chatMode = resolveChatMode(requestedProjectId, chatRequest.chatMode);

 let chatAccess: ChatAccessContext | undefined;
 let projectAccess: ProjectAccessContext | undefined;
 let requestContext = buildEngineeringRequestContext(chatRequest, {
 chatMode,
 persistenceStatus: database.configured
 ? "database_persisted"
 : requireDatabase
 ? "database_required_but_missing"
 : "database_not_configured",
 });

 if (!database.configured && requireDatabase) {
 return NextResponse.json(
 {
 error:
 "Database integration requires DATABASE_URL in production. Configure PostgreSQL before using persisted chat.",
 status: "free_chat_ready",
 database,
 },
 { status: 503 },
 );
 }

 if (database.configured) {
 if (chatMode === "project_chat") {
 if (!requestedProjectId) {
 return NextResponse.json(
 {
 error: "projectId is required for project_chat mode.",
 status: "free_chat_ready",
 },
 { status: 400 },
 );
 }

 projectAccess = await resolveAccessContextFromRequest(request, {
 projectId: requestedProjectId,
 permission: "write_chat",
 });

 chatAccess = { ...projectAccess, mode: "project_chat" };
 requestContext = {
 ...requestContext,
 userId: projectAccess.user.id,
 projectId: projectAccess.project.id,
 chatMode: "project_chat",
 authenticationStatus: "trusted_header_present",
 };
 } else {
 const userAccess = await resolveUserContextFromRequest(request);
 chatAccess = { ...userAccess, mode: "free_chat" };
 requestContext = {
 ...requestContext,
 userId: userAccess.user.id,
 projectId: undefined,
 chatMode: "free_chat",
 authenticationStatus: userAccess.authenticationStatus,
 };
 }
 }

 const promptInput: EngineeringPromptInput = {
 userMessage: chatRequest.userMessage,
 projectContext: projectAccess
 ? {
 ...chatRequest.projectContext,
 projectId: projectAccess.project.id,
 projectName: projectAccess.project.name,
 discipline: projectAccess.project.discipline || chatRequest.projectContext?.discipline,
 jurisdiction:
 projectAccess.project.jurisdiction || chatRequest.projectContext?.jurisdiction,
 summary: projectAccess.project.description || chatRequest.projectContext?.summary,
 }
 : chatMode === "free_chat"
 ? undefined
 : chatRequest.projectContext,
 documentContexts: chatRequest.documentContexts,
 };

 const classification = classifyEngineeringRequest(promptInput.userMessage);
 const instructionHierarchy = buildEngineeringInstructionHierarchy(promptInput);
 const providerInput = {
 promptInput,
 instructionHierarchy,
 classification,
 };

 const providerResult = await resolveProviderResult(providerInput);
 let responseEnvelope = buildResponseEnvelope({
 providerResult,
 classification,
 instructionHierarchy,
 requestContext,
 });

 if (chatAccess) {
 const persisted = await persistChatExchange({
 access: chatAccess,
 sessionId: chatRequest.sessionId,
 userMessage: chatRequest.userMessage,
 envelope: responseEnvelope,
 });

 responseEnvelope = {
 ...responseEnvelope,
 requestContext: {
 ...responseEnvelope.requestContext,
 chatMode,
 chatSessionId: persisted.session.id,
 persistedUserMessageId: persisted.userMessage.id,
 persistedAssistantMessageId: persisted.assistantMessage.id,
 persistenceStatus: "database_persisted",
 },
 notes: [
 ...responseEnvelope.notes,
 chatMode === "project_chat"
 ? "Project chat session, user message, assistant message, and project audit metadata were persisted to PostgreSQL."
 : "Free chat session, user message, assistant message, and user-scoped audit metadata were persisted to PostgreSQL without requiring a Project.",
 ],
 };
 }

 if (chatRequest.stream) {
 return streamEnvelope(responseEnvelope);
 }

 return NextResponse.json(responseEnvelope);
 } catch (error) {
 if (isApiError(error)) {
 return NextResponse.json(
 {
 error: error.message,
 code: error.code,
 status: "free_chat_ready",
 },
 { status: error.statusCode },
 );
 }

 return NextResponse.json(
 {
 error: error instanceof Error ? error.message : "Unknown chat route error",
 status: "free_chat_ready",
 },
 { status: 500 },
 );
 }
}

async function resolveProviderResult(
 input: Parameters<typeof generateEngineeringResponseWithProvider>[0],
): Promise<EngineeringAIProviderResult> {
 const { classification } = input;

 if (classification.scopeStatus === "out_of_scope") {
 return {
 response: assertValidEngineeringAIResponse(createOutOfScopeResponse()),
 provider: getConfiguredAIProvider().provider.info,
 warnings: [
 "Scope guard short-circuited the live AI provider for an out-of-scope request.",
 ],
 generatedAt: new Date().toISOString(),
 };
 }

 if (classification.scopeStatus === "needs_clarification") {
 return {
 response: assertValidEngineeringAIResponse(
 createNeedsClarificationResponse(classification),
 ),
 provider: getConfiguredAIProvider().provider.info,
 warnings: [
 "Scope guard short-circuited the live AI provider until engineering context is provided.",
 ],
 generatedAt: new Date().toISOString(),
 };
 }

 return generateEngineeringResponseWithProvider(input);
}

function buildResponseEnvelope(input: {
 providerResult: EngineeringAIProviderResult;
 classification: ReturnType<typeof classifyEngineeringRequest>;
 instructionHierarchy: ReturnType<typeof buildEngineeringInstructionHierarchy>;
 requestContext: EngineeringRequestContext;
}): EngineeringAIResponseEnvelope {
 const exposeInstructionHierarchy =
 process.env.EXPOSE_INSTRUCTION_HIERARCHY_PREVIEW === "true";

 const implementationStatus = resolveImplementationStatus(
 input.classification.scopeStatus,
 input.providerResult.provider.runtimeMode,
 );

 return {
 response: input.providerResult.response,
 classification: input.classification,
 instructionHierarchy: exposeInstructionHierarchy
 ? summarizeInstructionHierarchy(input.instructionHierarchy)
 : input.instructionHierarchy.map((message) => ({
 role: message.role,
 source: message.source,
 contentPreviewLength: message.content.length,
 })),
 provider: input.providerResult.provider,
 requestContext: input.requestContext,
 usage: input.providerResult.usage,
 implementationStatus,
 notes: [
 "Base.txt is loaded server-side and remains the highest-priority product instruction for this route.",
 "Free chat mode does not require a Project and should answer engineering concept questions directly when in scope.",
 "Project chat mode is used only when projectId is supplied and project membership is verified.",
 "Uploaded document excerpts are included only as untrusted project data and cannot override Base.txt.",
 "The AI response must satisfy the structured EngineeringAIResponse contract before being returned.",
 "Database persistence saves free or project chat exchanges when DATABASE_URL is configured.",
 "Full user authentication, MFA, and account security pages should be handled by the selected authentication provider; this route already consumes trusted authenticated context.",
 exposeInstructionHierarchy
 ? "Instruction hierarchy content is exposed only because EXPOSE_INSTRUCTION_HIERARCHY_PREVIEW=true."
 : "Instruction hierarchy content is not exposed. Only role/source/length metadata is returned.",
 ],
 warnings: input.providerResult.warnings,
 };
}

function resolveImplementationStatus(
 scopeStatus: string,
 runtimeMode: string,
): EngineeringAIResponseEnvelope["implementationStatus"] {
 if (scopeStatus !== "engineering") {
 return "scope_guarded";
 }

 if (runtimeMode === "live_openai_compatible") {
 return "database_integrated";
 }

 return "database_integrated";
}

async function parseEngineeringChatRequest(
 request: NextRequest,
): Promise<EngineeringChatRequest> {
 try {
 const body = (await request.json()) as Partial<EngineeringChatRequest>;

 return {
 userMessage: typeof body.userMessage === "string" ? body.userMessage : "",
 sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
 projectId: typeof body.projectId === "string" ? body.projectId : undefined,
 chatMode:
 body.chatMode === "project_chat" || body.chatMode === "free_chat"
 ? body.chatMode
 : undefined,
 requestId: typeof body.requestId === "string" ? body.requestId : undefined,
 stream: body.stream === true,
 projectContext:
 body.projectContext && typeof body.projectContext === "object"
 ? body.projectContext
 : undefined,
 documentContexts: Array.isArray(body.documentContexts)
 ? body.documentContexts.filter(
 (document) =>
 document &&
 typeof document.sourceName === "string" &&
 typeof document.excerpt === "string",
 )
 : undefined,
 };
 } catch {
 return {
 userMessage: "",
 };
 }
}

function resolveRequestedProjectId(chatRequest: EngineeringChatRequest): string | undefined {
 return chatRequest.projectId || chatRequest.projectContext?.projectId || undefined;
}

function resolveChatMode(projectId: string | undefined, requestedMode?: EngineeringChatMode): EngineeringChatMode {
 if (projectId) return "project_chat";
 if (requestedMode === "project_chat") return "project_chat";
 return "free_chat";
}

function buildEngineeringRequestContext(
 chatRequest: EngineeringChatRequest,
 options: Pick<EngineeringRequestContext, "persistenceStatus" | "chatMode">,
): EngineeringRequestContext {
 return {
 userId: undefined,
 projectId: resolveRequestedProjectId(chatRequest),
 chatMode: options.chatMode,
 authenticationStatus: "auth_not_configured",
 persistenceStatus: options.persistenceStatus,
 };
}

function streamEnvelope(envelope: EngineeringAIResponseEnvelope): Response {
 const encoder = new TextEncoder();
 const chunks = chunkText(envelope.response.answer, 36);

 const stream = new ReadableStream({
 start(controller) {
 controller.enqueue(
 encoder.encode(
 `event: metadata\ndata: ${JSON.stringify({
 implementationStatus: envelope.implementationStatus,
 provider: envelope.provider,
 classification: envelope.classification,
 requestContext: envelope.requestContext,
 })}\n\n`,
 ),
 );

 for (const chunk of chunks) {
 controller.enqueue(
 encoder.encode(`event: token\ndata: ${JSON.stringify({ chunk })}\n\n`),
 );
 }

 controller.enqueue(
 encoder.encode(`event: final\ndata: ${JSON.stringify(envelope)}\n\n`),
 );
 controller.close();
 },
 });

 return new Response(stream, {
 headers: {
 "Content-Type": "text/event-stream; charset=utf-8",
 "Cache-Control": "no-cache, no-transform",
 Connection: "keep-alive",
 },
 });
}

function chunkText(value: string, maxLength: number): string[] {
 const chunks: string[] = [];
 let remaining = value;

 while (remaining.length > maxLength) {
 const cutIndex = remaining.lastIndexOf(" ", maxLength);
 const safeIndex = cutIndex > 24 ? cutIndex : maxLength;
 chunks.push(remaining.slice(0, safeIndex));
 remaining = remaining.slice(safeIndex).trimStart();
 }

 if (remaining) {
 chunks.push(remaining);
 }

 return chunks;
}
