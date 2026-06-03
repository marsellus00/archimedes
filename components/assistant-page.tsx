"use client";

import {
 useEffect,
 useMemo,
 useRef,
 useState,
 type ChangeEvent,
 type FormEvent,
 type KeyboardEvent,
 type ReactNode,
} from "react";
import {
 AlertTriangle,
 CheckCircle2,
 ChevronLeft,
 ChevronRight,
 Clock3,
 FileText,
 Mic,
 Paperclip,
 Plus,
 Send,
 Settings,
 Sigma,
 Database,
 X,
} from "lucide-react";

type ScopeStatus = "engineering" | "out_of_scope" | "needs_clarification";
type ConfidenceLevel = "rough_estimate" | "preliminary" | "detailed" | "not_applicable";

type EngineeringAIResponse = {
 answer: string;
 scopeStatus: ScopeStatus;
 assumptions: string[];
 missingData: string[];
 safetyWarnings: string[];
 standardsReferenced: string[];
 requiresProfessionalReview: boolean;
 confidenceLevel: ConfidenceLevel;
};

type ChatEnvelope = {
 response: EngineeringAIResponse;
 provider?: {
 providerName: string;
 providerMode: string;
 runtimeMode: string;
 model?: string;
 liveEnabled: boolean;
 configured: boolean;
 };
 classification?: {
 category?: string;
 scopeStatus?: ScopeStatus;
 };
 usage?: {
 promptTokens?: number;
 completionTokens?: number;
 totalTokens?: number;
 };
 implementationStatus?: string;
 requestContext?: {
 chatSessionId?: string;
 projectId?: string;
 chatMode?: "free_chat" | "project_chat";
 persistenceStatus?: string;
 persistedUserMessageId?: string;
 persistedAssistantMessageId?: string;
 };
 warnings?: string[];
};

type ProviderStatus = {
 provider?: ChatEnvelope["provider"];
 selectionWarnings?: string[];
};

type ChatMessage = {
 id: string;
 role: "user" | "assistant";
 content: string;
 envelope?: ChatEnvelope;
 createdAt: string;
 isStreaming?: boolean;
};

type PersistedChatMessage = {
 id: string;
 role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
 content: string;
 metadataJson?: Record<string, unknown> | null;
 createdAt: string;
};

type PersistedChatSession = {
 id: string;
 title: string;
 mode: "FREE_CHAT" | "PROJECT_CHAT";
 createdAt: string;
 updatedAt: string;
 messages?: PersistedChatMessage[];
};

type HistoryEnvelope = {
 status?: string;
 mode?: "free_chat" | "project_chat";
 history?: {
 chatSessions?: PersistedChatSession[];
 };
 session?: PersistedChatSession;
 error?: string;
 message?: string;
};

const SUGGESTED_PROMPTS = [
 "List the inputs required for a preliminary centrifugal pump sizing review.",
 "Create a commissioning checklist for a standby generator startup.",
 "What assumptions should I document for a pressure-drop estimate?",
 "What is thermodynamics?",
];

const secondaryActions = [
 { label: "Attach file", icon: Paperclip, note: "File upload planned" },
 { label: "Calculation", icon: Sigma, note: "Calculation modules active at /calculators" },
 { label: "Document context", icon: FileText, note: "Document retrieval planned" },
 { label: "Voice", icon: Mic, note: "Later enhancement" },
];

const ASSISTANT_GUEST_USER_ID_KEY = "engineering-gpt.guest-user-id";
const ASSISTANT_GUEST_USER_EMAIL_KEY = "engineering-gpt.guest-user-email";
const ASSISTANT_GUEST_USER_NAME_KEY = "engineering-gpt.guest-user-name";
const ACTIVE_FREE_CHAT_SESSION_KEY = "engineering-gpt.active-free-chat-session-id";
const CHAT_HISTORY_COLLAPSED_KEY = "engineering-gpt.chat-history-panel-collapsed";

function createId() {
 if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
 return crypto.randomUUID();
 }

 return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type AssistantGuestIdentity = {
 id: string;
 email: string;
 name: string;
};

function getOrCreateAssistantGuestIdentity(): AssistantGuestIdentity | null {
 if (typeof window === "undefined") return null;

 let id = window.localStorage.getItem(ASSISTANT_GUEST_USER_ID_KEY);
 if (!id) {
 id = `guest-${createId()}`;
 window.localStorage.setItem(ASSISTANT_GUEST_USER_ID_KEY, id);
 }

 const emailSafeId = id.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
 let email = window.localStorage.getItem(ASSISTANT_GUEST_USER_EMAIL_KEY);
 if (!email) {
 email = `${emailSafeId}@engineering.local`;
 window.localStorage.setItem(ASSISTANT_GUEST_USER_EMAIL_KEY, email);
 }

 let name = window.localStorage.getItem(ASSISTANT_GUEST_USER_NAME_KEY);
 if (!name) {
 name = "Engineering Workspace User";
 window.localStorage.setItem(ASSISTANT_GUEST_USER_NAME_KEY, name);
 }

 return { id, email, name };
}

function getAssistantRequestHeaders(includeJsonContentType = false): Record<string, string> {
 const headers: Record<string, string> = includeJsonContentType
 ? { "Content-Type": "application/json" }
 : {};
 const identity = getOrCreateAssistantGuestIdentity();

 if (identity) {
 headers["x-engineering-user-id"] = identity.id;
 headers["x-engineering-user-email"] = identity.email;
 headers["x-engineering-user-name"] = identity.name;
 }

 return headers;
}

function getScopedActiveSessionKey() {
 const identity = getOrCreateAssistantGuestIdentity();
 return identity ? `${ACTIVE_FREE_CHAT_SESSION_KEY}.${identity.id}` : ACTIVE_FREE_CHAT_SESSION_KEY;
}

function appendStreamChunk(currentContent: string, chunk: string) {
 if (!chunk) return currentContent;
 if (!currentContent) return chunk;
 if (currentContent.endsWith("\n") || /^[.,;:!?)]/.test(chunk)) return `${currentContent}${chunk}`;
 return `${currentContent} ${chunk}`;
}

function wait(milliseconds: number) {
 return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function parseServerSentEvent(block: string): { eventName: string; data: string } | null {
 const lines = block.split(/\r?\n/);
 let eventName = "message";
 const dataLines: string[] = [];

 for (const line of lines) {
 if (line.startsWith("event:")) {
 eventName = line.slice("event:".length).trim();
 }

 if (line.startsWith("data:")) {
 dataLines.push(line.slice("data:".length).trimStart());
 }
 }

 if (!dataLines.length) return null;
 return { eventName, data: dataLines.join("\n") };
}

function toStringDate(value: string | Date | undefined) {
 if (!value) return new Date().toISOString();
 if (value instanceof Date) return value.toISOString();
 return value;
}

function readMetadata(message: PersistedChatMessage): Record<string, unknown> {
 return message.metadataJson && typeof message.metadataJson === "object"
 ? message.metadataJson
 : {};
}

function restoreEnvelopeFromPersistedMessage(
 message: PersistedChatMessage,
 session: PersistedChatSession,
): ChatEnvelope | undefined {
 if (message.role !== "ASSISTANT") return undefined;

 const metadata = readMetadata(message);
 const response = metadata.response;

 if (!response || typeof response !== "object") return undefined;

 return {
 response: response as EngineeringAIResponse,
 provider: metadata.provider as ChatEnvelope["provider"],
 classification: metadata.classification as ChatEnvelope["classification"],
 implementationStatus: metadata.implementationStatus as string | undefined,
 warnings: Array.isArray(metadata.warnings) ? (metadata.warnings as string[]) : undefined,
 requestContext: {
 chatSessionId: session.id,
 chatMode: session.mode === "PROJECT_CHAT" ? "project_chat" : "free_chat",
 persistenceStatus: "database_persisted",
 },
 };
}

function restoreMessagesFromSession(session: PersistedChatSession): ChatMessage[] {
 return (session.messages ?? [])
 .filter((message) => message.role === "USER" || message.role === "ASSISTANT")
 .map((message) => ({
 id: message.id,
 role: message.role === "USER" ? "user" : "assistant",
 content: message.content,
 envelope: restoreEnvelopeFromPersistedMessage(message, session),
 createdAt: toStringDate(message.createdAt),
 }));
}

export function AssistantPage() {
 const [messages, setMessages] = useState<ChatMessage[]>([]);
 const [input, setInput] = useState("");
 const [isSending, setIsSending] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [toolNotice, setToolNotice] = useState<string | null>(null);
 const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
 const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
 const [chatHistory, setChatHistory] = useState<PersistedChatSession[]>([]);
 const [isLoadingHistory, setIsLoadingHistory] = useState(false);
 const [historyError, setHistoryError] = useState<string | null>(null);
 const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
 const [historyPanelCollapsed, setHistoryPanelCollapsed] = useState(false);
 const [hasRestoredInitialSession, setHasRestoredInitialSession] = useState(false);
 const scrollRef = useRef<HTMLDivElement | null>(null);
 const textareaRef = useRef<HTMLTextAreaElement | null>(null);

 useEffect(() => {
 let ignore = false;

 async function loadProviderStatus() {
 try {
 const response = await fetch("/api/chat", { method: "GET" });
 if (!response.ok) return;
 const data = (await response.json()) as ProviderStatus;
 if (!ignore) setProviderStatus(data);
 } catch {
 if (!ignore) {
 setProviderStatus({
 selectionWarnings: ["Chat provider status could not be loaded."],
 });
 }
 }
 }

 loadProviderStatus();

 return () => {
 ignore = true;
 };
 }, []);

 useEffect(() => {
 void loadChatHistory({ restoreActiveSession: true });
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 useEffect(() => {
 if (typeof window === "undefined") return;
 setHistoryPanelCollapsed(
 window.localStorage.getItem(CHAT_HISTORY_COLLAPSED_KEY) === "true",
 );
 }, []);

 useEffect(() => {
 scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
 }, [messages, isSending]);

 const providerLabel = useMemo(() => {
 const provider = providerStatus?.provider;
 if (!provider) return "Checking provider";
 if (provider.runtimeMode === "live_openai_compatible") {
 return `Live AI${provider.model ? ` · ${provider.model}` : ""}`;
 }
 if (provider.runtimeMode === "deterministic_mock") return "Mock review mode";
 return provider.runtimeMode.replaceAll("_", " ");
 }, [providerStatus]);

 const providerIsLive = providerStatus?.provider?.runtimeMode === "live_openai_compatible";

 function resizeComposer(value: string) {
 setInput(value);
 requestAnimationFrame(() => {
 const textarea = textareaRef.current;
 if (!textarea) return;
 textarea.style.height = "auto";
 textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 52), 180)}px`;
 });
 }

 function resetComposer() {
 setInput("");
 requestAnimationFrame(() => {
 const textarea = textareaRef.current;
 if (!textarea) return;
 textarea.style.height = "52px";
 });
 }

 async function loadChatHistory(options?: { restoreActiveSession?: boolean }) {
 setIsLoadingHistory(true);
 setHistoryError(null);

 try {
 const response = await fetch("/api/history", {
 method: "GET",
 headers: getAssistantRequestHeaders(),
 });
 const data = (await response.json()) as HistoryEnvelope;

 if (!response.ok || data.error) {
 throw new Error(data.error ?? data.message ?? "Could not load chat history.");
 }

 const sessions = data.history?.chatSessions ?? [];
 setChatHistory(sessions);

 if (options?.restoreActiveSession && !hasRestoredInitialSession) {
 const storedSessionId =
 typeof window !== "undefined"
 ? window.localStorage.getItem(getScopedActiveSessionKey())
 : null;
 const sessionToRestore =
 sessions.find((session) => session.id === storedSessionId) ?? sessions[0];

 if (sessionToRestore) {
 await loadChatSession(sessionToRestore.id, { silentHistoryRefresh: true });
 }

 setHasRestoredInitialSession(true);
 }
 } catch (caughtError) {
 setHistoryError(
 caughtError instanceof Error ? caughtError.message : "Unknown chat history error.",
 );
 } finally {
 setIsLoadingHistory(false);
 }
 }

 async function loadChatSession(
 sessionId: string,
 options?: { silentHistoryRefresh?: boolean },
 ) {
 setError(null);
 setToolNotice(null);

 try {
 const response = await fetch(`/api/history?sessionId=${encodeURIComponent(sessionId)}`, {
 method: "GET",
 headers: getAssistantRequestHeaders(),
 });
 const data = (await response.json()) as HistoryEnvelope;

 if (!response.ok || data.error || !data.session) {
 throw new Error(data.error ?? data.message ?? "Could not load chat session.");
 }

 setMessages(restoreMessagesFromSession(data.session));
 setActiveSessionId(data.session.id);
 if (typeof window !== "undefined") {
 window.localStorage.setItem(getScopedActiveSessionKey(), data.session.id);
 }

 if (!options?.silentHistoryRefresh) {
 await loadChatHistory({ restoreActiveSession: false });
 }
 } catch (caughtError) {
 setError(caughtError instanceof Error ? caughtError.message : "Unknown session load error.");
 }
 }

 async function sendMessage(messageOverride?: string) {
 const userMessage = (messageOverride ?? input).trim();
 if (!userMessage || isSending) return;

 const userEntry: ChatMessage = {
 id: createId(),
 role: "user",
 content: userMessage,
 createdAt: new Date().toISOString(),
 };
 const assistantEntryId = createId();

 setMessages((current) => [
 ...current,
 userEntry,
 {
 id: assistantEntryId,
 role: "assistant",
 content: "",
 createdAt: new Date().toISOString(),
 isStreaming: true,
 },
 ]);
 resetComposer();
 setError(null);
 setToolNotice(null);
 setIsSending(true);

 try {
 const response = await fetch("/api/chat", {
 method: "POST",
 headers: getAssistantRequestHeaders(true),
 body: JSON.stringify({
 userMessage,
 chatMode: "free_chat",
 sessionId: activeSessionId ?? undefined,
 stream: true,
 }),
 });

 if (!response.ok || !response.body) {
 const errorPayload = (await response.json().catch(() => null)) as
 | { error?: string; message?: string }
 | null;
 throw new Error(errorPayload?.error ?? errorPayload?.message ?? "The chat request failed.");
 }

 const reader = response.body.getReader();
 const decoder = new TextDecoder();
 let buffer = "";
 let finalEnvelope: ChatEnvelope | null = null;
 let displayedAssistantText = "";
 let pendingAssistantText = "";
 let isAnimatingAssistantText = false;

 const updateStreamingAssistantText = (content: string) => {
 setMessages((current) =>
 current.map((message) =>
 message.id === assistantEntryId
 ? { ...message, content, isStreaming: true }
 : message,
 ),
 );
 };

 const revealQueuedAssistantText = async () => {
 if (isAnimatingAssistantText) return;
 isAnimatingAssistantText = true;

 while (pendingAssistantText.length > 0) {
 const nextCharacter = pendingAssistantText[0];
 pendingAssistantText = pendingAssistantText.slice(1);
 displayedAssistantText += nextCharacter;
 updateStreamingAssistantText(displayedAssistantText);
 await wait(nextCharacter === "\n" ? 18 : 8);
 }

 isAnimatingAssistantText = false;
 };

 const queueAssistantText = (chunk: string) => {
 if (!chunk) return;
 const currentFullText = displayedAssistantText + pendingAssistantText;
 const nextFullText = appendStreamChunk(currentFullText, chunk);
 pendingAssistantText += nextFullText.slice(currentFullText.length);
 void revealQueuedAssistantText();
 };

 const waitForAssistantTextToFinish = async () => {
 while (isAnimatingAssistantText || pendingAssistantText.length > 0) {
 if (!isAnimatingAssistantText && pendingAssistantText.length > 0) {
 void revealQueuedAssistantText();
 }
 await wait(20);
 }
 };

 while (true) {
 const { done, value } = await reader.read();
 if (done) break;

 buffer += decoder.decode(value, { stream: true });
 const eventBlocks = buffer.split("\n\n");
 buffer = eventBlocks.pop() ?? "";

 for (const eventBlock of eventBlocks) {
 const parsedEvent = parseServerSentEvent(eventBlock);
 if (!parsedEvent) continue;

 if (parsedEvent.eventName === "token") {
 const payload = JSON.parse(parsedEvent.data) as { chunk?: string };
 queueAssistantText(payload.chunk ?? "");
 }

 if (parsedEvent.eventName === "final") {
 finalEnvelope = JSON.parse(parsedEvent.data) as ChatEnvelope;
 }
 }
 }

 if (!finalEnvelope) {
 throw new Error("The chat stream ended before final response metadata was returned.");
 }

 const completedEnvelope = finalEnvelope;
 const visibleQueuedText = displayedAssistantText + pendingAssistantText;
 if (completedEnvelope.response.answer.startsWith(visibleQueuedText)) {
 pendingAssistantText += completedEnvelope.response.answer.slice(visibleQueuedText.length);
 void revealQueuedAssistantText();
 }
 await waitForAssistantTextToFinish();

 if (completedEnvelope.requestContext?.chatSessionId) {
 setActiveSessionId(completedEnvelope.requestContext.chatSessionId);
 if (typeof window !== "undefined") {
 window.localStorage.setItem(
 getScopedActiveSessionKey(),
 completedEnvelope.requestContext.chatSessionId,
 );
 }
 }

 setMessages((current) =>
 current.map((message) =>
 message.id === assistantEntryId
 ? {
 ...message,
 content: completedEnvelope.response.answer,
 envelope: completedEnvelope,
 isStreaming: false,
 }
 : message,
 ),
 );

 void loadChatHistory({ restoreActiveSession: false });
 } catch (caughtError) {
 const message = caughtError instanceof Error ? caughtError.message : "Unknown chat error.";
 const fallbackAnswer =
 "I could not complete that chat request. Check the AI provider configuration and try again.";
 setError(message);
 setMessages((current) =>
 current.map((chatMessage) =>
 chatMessage.id === assistantEntryId
 ? {
 ...chatMessage,
 content: fallbackAnswer,
 envelope: {
 response: {
 answer: fallbackAnswer,
 scopeStatus: "needs_clarification",
 assumptions: [],
 missingData: [message],
 safetyWarnings: [],
 standardsReferenced: [],
 requiresProfessionalReview: false,
 confidenceLevel: "not_applicable",
 },
 warnings: [message],
 },
 isStreaming: false,
 }
 : chatMessage,
 ),
 );
 } finally {
 setIsSending(false);
 textareaRef.current?.focus();
 }
 }

 function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
 if (event.key !== "Enter") return;

 if (event.shiftKey) return;

 event.preventDefault();
 sendMessage();
 }

 function updateHistoryPanelCollapsed(collapsed: boolean) {
 setHistoryPanelCollapsed(collapsed);
 if (typeof window !== "undefined") {
 window.localStorage.setItem(CHAT_HISTORY_COLLAPSED_KEY, String(collapsed));
 }
 }

 function startNewChat() {
 setMessages([]);
 setActiveSessionId(null);
 if (typeof window !== "undefined") {
 window.localStorage.removeItem(getScopedActiveSessionKey());
 }
 setError(null);
 setToolNotice(null);
 resetComposer();
 textareaRef.current?.focus();
 }

 return (
 <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-transparent text-slate-200">
 <header className="shrink-0 border-b border-slate-700/30 bg-[#0d1117]/70 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
 <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-tight">
 <span className="text-slate-500">SOMATRIX</span>
 <span className="text-slate-500">&gt;</span>
 <span className="font-bold text-sky-300">AI Assistant</span>
 <span
 className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
 providerIsLive
 ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
 : "border-amber-400/20 bg-amber-400/5 text-amber-300"
 }`}
 >
 {providerLabel}
 </span>
 </div>
 </div>

 <div className="flex flex-wrap gap-2">

 <button
 type="button"
 onClick={() => setHistoryPanelOpen(true)}
 className="inline-flex w-fit items-center gap-2 border border-slate-700/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-sky-300/40 hover:bg-sky-300/10 hover:text-sky-300 xl:hidden"
 >
 <Clock3 className="h-4 w-4" />
 History
 </button>

 <button
 type="button"
 onClick={startNewChat}
 className="inline-flex w-fit items-center gap-2 border border-sky-300/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-sky-300 transition hover:bg-sky-300/10"
 >
 <Plus className="h-4 w-4" />
 New chat
 </button>
 </div>
 </div>

 {providerStatus?.selectionWarnings?.length ? (
 <div className="mt-3 border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
 {providerStatus.selectionWarnings.join(" ")}
 </div>
 ) : null}
 </header>

 <div className="flex min-h-0 flex-1">
 <main className="flex min-w-0 flex-1 flex-col">
 <section className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
 {messages.length === 0 ? (
 <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center py-8">
 <div className="max-w-3xl">
 <div className="mb-4 inline-flex rounded-full border border-sky-300/20 bg-sky-300/5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-sky-300">
 Engineering assistant ready
 </div>
 <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
 Start a technical engineering conversation
 </h2>
 <p className="mt-3 text-sm leading-6 text-slate-400">
 Ask an engineering question, paste rough data, or request a calculation, review, troubleshooting plan, or documentation draft.
 </p>
 </div>

 <div className="mt-8 grid gap-3 md:grid-cols-3">
 {SUGGESTED_PROMPTS.map((prompt) => (
 <button
 key={prompt}
 type="button"
 onClick={() => sendMessage(prompt)}
 disabled={isSending}
 className="border border-slate-700/40 bg-[#10141a] p-4 text-left text-sm leading-6 text-slate-300 transition hover:border-sky-300/40 hover:bg-sky-300/5 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
 >
 {prompt}
 </button>
 ))}
 </div>
 </div>
 ) : (
 <div className="mx-auto max-w-6xl space-y-5">
 {messages.map((message) => (
 <ChatMessageCard key={message.id} message={message} />
 ))}
 <div ref={scrollRef} />
 </div>
 )}
 </section>

 <section className="shrink-0 border-t border-slate-700/30 bg-[#10141a]/95 px-4 py-3 shadow-[0_-18px_50px_rgba(0,0,0,0.32)] backdrop-blur sm:px-6 lg:px-8">
 <form
 className="mx-auto max-w-6xl"
 onSubmit={(event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();
 sendMessage();
 }}
 >
 {error ? (
 <div className="mb-3 flex items-start gap-2 border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-200">
 <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
 <span>{error}</span>
 </div>
 ) : null}

 {toolNotice ? (
 <div className="mb-3 flex items-start gap-2 border border-sky-300/20 bg-sky-300/5 px-3 py-2 text-sm text-sky-100">
 <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
 <span>{toolNotice}</span>
 </div>
 ) : null}

 <div className="rounded-2xl border border-slate-700/50 bg-[#0a0e14] transition focus-within:border-sky-300 focus-within:ring-1 focus-within:ring-sky-300/40">
 <label htmlFor="engineering-chat-input" className="sr-only">
 Engineering chat message
 </label>
 <textarea
 ref={textareaRef}
 id="engineering-chat-input"
 value={input}
 onChange={(event: ChangeEvent<HTMLTextAreaElement>) => resizeComposer(event.target.value)}
 onKeyDown={handleKeyDown}
 rows={1}
 placeholder="Describe the engineering problem, calculation, equipment issue, standard/code question, or documentation task..."
 className="h-[52px] max-h-[180px] min-h-[52px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600"
 />
 </div>

 <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
 <div className="assistant-action-bar flex min-w-0 flex-1 flex-nowrap gap-2">
 {secondaryActions.map(({ label, icon: Icon, note }) => (
 <button
 key={label}
 type="button"
 aria-label={label}
 onClick={() => setToolNotice(`${label} is reserved for ${note}. Chat is active now.`)}
 className="assistant-action-button inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700/40 bg-[#181c22] px-3 text-xs text-slate-400 transition hover:border-sky-300/30 hover:text-sky-200"
 title={`${label}: ${note}`}
 >
 <Icon className="h-4 w-4 shrink-0" />
 <span className="assistant-action-label whitespace-nowrap">{label}</span>
 </button>
 ))}
 </div>

 <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
 <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
 Enter sends · Shift + Enter adds a line
 </div>
 <button
 type="submit"
 disabled={!input.trim() || isSending}
 className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl bg-sky-300 px-4 text-xs font-bold uppercase tracking-widest text-[#003259] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 sm:min-w-36 sm:px-5"
 >
 <span className="hidden sm:inline">{isSending ? "Sending" : "Send message"}</span>
 <Send className="h-4 w-4" />
 </button>
 </div>
 </div>
 </form>
 </section>
 </main>

 {historyPanelCollapsed ? (
 <CollapsedChatHistoryRail
 chatCount={chatHistory.length}
 isLoadingHistory={isLoadingHistory}
 onExpand={() => updateHistoryPanelCollapsed(false)}
 />
 ) : (
 <ChatHistoryPanel
 activeSessionId={activeSessionId}
 chatHistory={chatHistory}
 historyError={historyError}
 isLoadingHistory={isLoadingHistory}
 onClose={() => updateHistoryPanelCollapsed(true)}
 onNewChat={startNewChat}
 onRefresh={() => loadChatHistory({ restoreActiveSession: false })}
 onSelectSession={loadChatSession}
 />
 )}
 </div>

 {historyPanelOpen ? (
 <div className="fixed inset-0 z-50 xl:hidden">
 <button
 type="button"
 aria-label="Close chat history"
 className="absolute inset-0 bg-black/60"
 onClick={() => setHistoryPanelOpen(false)}
 />
 <div className="absolute right-0 top-0 h-full w-full max-w-[360px] border-l border-slate-700/40 bg-[#10141a] shadow-2xl shadow-black/50">
 <ChatHistoryPanel
 activeSessionId={activeSessionId}
 chatHistory={chatHistory}
 historyError={historyError}
 isLoadingHistory={isLoadingHistory}
 onClose={() => setHistoryPanelOpen(false)}
 onNewChat={() => {
 startNewChat();
 setHistoryPanelOpen(false);
 }}
 onRefresh={() => loadChatHistory({ restoreActiveSession: false })}
 onSelectSession={(sessionId) => {
 void loadChatSession(sessionId);
 setHistoryPanelOpen(false);
 }}
 variant="drawer"
 />
 </div>
 </div>
 ) : null}
 </div>
 );
}

function formatChatModeLabel(value: string) {
 return value.toLowerCase() === "free_chat" ? "general chat" : value.replaceAll("_", " ").toLowerCase();
}

function formatSessionDate(value: string) {
 try {
 return new Date(value).toLocaleString(undefined, {
 month: "short",
 day: "numeric",
 hour: "numeric",
 minute: "2-digit",
 });
 } catch {
 return value;
 }
}

function ChatHistoryPanel({
 activeSessionId,
 chatHistory,
 historyError,
 isLoadingHistory,
 onClose,
 onNewChat,
 onRefresh,
 onSelectSession,
 variant = "desktop",
}: {
 activeSessionId: string | null;
 chatHistory: PersistedChatSession[];
 historyError: string | null;
 isLoadingHistory: boolean;
 onClose?: () => void;
 onNewChat: () => void;
 onRefresh: () => void | Promise<void>;
 onSelectSession: (sessionId: string) => void | Promise<void>;
 variant?: "desktop" | "drawer";
}) {
 return (
 <aside
 className={`min-h-0 shrink-0 flex-col border-l border-slate-700/30 bg-[#0d1117]/85 ${
 variant === "desktop" ? "hidden w-80 xl:flex 2xl:w-[360px]" : "flex h-full w-full"
 }`}
 >
 <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700/30 px-4 py-4">
 <div>
 <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-sky-300">
 <Clock3 className="h-3.5 w-3.5" />
 Chat history
 </div>
 <p className="mt-1 text-xs text-slate-500">Your engineering chats</p>
 </div>

 {onClose ? (
 <button
 type="button"
 aria-label={variant === "desktop" ? "Collapse chat history" : "Close chat history"}
 onClick={onClose}
 className="border border-slate-700/50 p-2 text-slate-400 transition hover:border-sky-300/40 hover:text-sky-300"
 >
 {variant === "desktop" ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
 </button>
 ) : null}
 </div>

 <div className="grid grid-cols-2 gap-2 border-b border-slate-700/30 p-4">
 <button
 type="button"
 onClick={onNewChat}
 className="inline-flex items-center justify-center gap-2 border border-sky-300/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-sky-300 transition hover:bg-sky-300/10"
 >
 <Plus className="h-4 w-4" />
 New
 </button>
 <button
 type="button"
 onClick={onRefresh}
 className="border border-slate-700/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition hover:border-sky-300/40 hover:text-sky-300"
 >
 Refresh
 </button>
 </div>

 <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
 {historyError ? (
 <div className="border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs leading-5 text-amber-200">
 {historyError}
 </div>
 ) : null}

 {isLoadingHistory && !chatHistory.length ? (
 <div className="text-xs text-slate-500">Loading saved chats...</div>
 ) : null}

 {!isLoadingHistory && !historyError && chatHistory.length === 0 ? (
 <div className="border border-slate-700/30 bg-[#10141a] p-4 text-xs leading-5 text-slate-500">
 No saved chats yet. Your first completed chat will appear here.
 </div>
 ) : null}

 {chatHistory.length ? (
 <div className="space-y-2">
 {chatHistory.map((session) => {
 const isActiveSession = activeSessionId === session.id;

 return (
 <button
 key={session.id}
 type="button"
 onClick={() => onSelectSession(session.id)}
 className={`w-full border px-3 py-3 text-left transition ${
 isActiveSession
 ? "border-sky-300/50 bg-sky-300/10 shadow-[inset_3px_0_0_rgba(125,211,252,0.8)]"
 : "border-slate-700/40 bg-[#10141a] hover:border-sky-300/30 hover:bg-sky-300/5"
 }`}
 >
 <div className="line-clamp-2 text-xs font-semibold leading-5 text-slate-200">
 {session.title}
 </div>
 <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
 <span>{formatChatModeLabel(session.mode)}</span>
 <span>{formatSessionDate(session.updatedAt)}</span>
 </div>
 </button>
 );
 })}
 </div>
 ) : null}
 </div>
 </aside>
 );
}

function CollapsedChatHistoryRail({
 chatCount,
 isLoadingHistory,
 onExpand,
}: {
 chatCount: number;
 isLoadingHistory: boolean;
 onExpand: () => void;
}) {
 return (
 <aside className="hidden w-14 shrink-0 border-l border-slate-700/30 bg-[#0d1117]/85 xl:flex">
 <button
 type="button"
 aria-label="Expand chat history"
 onClick={onExpand}
 className="flex h-full w-full flex-col items-center gap-3 px-2 py-4 text-slate-400 transition hover:bg-sky-300/5 hover:text-sky-300"
 >
 <ChevronLeft className="h-4 w-4" />
 <Clock3 className="h-4 w-4" />
 <span className="font-mono text-[10px] uppercase tracking-widest [writing-mode:vertical-rl]">
 History
 </span>
 <span className="mt-auto rounded-full border border-slate-700/50 px-2 py-1 font-mono text-[10px] text-slate-500">
 {isLoadingHistory ? "..." : chatCount}
 </span>
 </button>
 </aside>
 );
}

function ChatMessageCard({ message }: { message: ChatMessage }) {
 const isUser = message.role === "user";
 const response = message.envelope?.response;

 if (isUser) {
 return (
 <article className="flex justify-end">
 <div className="max-w-[82%] border-r-4 border-sky-300/60 bg-slate-800/90 p-4 text-sm leading-6 text-slate-100 shadow-lg shadow-black/10">
 <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-sky-300">You</div>
 <p className="whitespace-pre-wrap">{message.content}</p>
 </div>
 </article>
 );
 }

 return (
 <article className="max-w-[94%] border border-slate-700/40 bg-[#181c22] p-4 shadow-lg shadow-black/10">
 <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/30 pb-3">
 <div>
 <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
 Engineering Assistant
 </div>
 <div className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
 {response?.scopeStatus ?? "response"}
 {response?.confidenceLevel ? ` · ${response.confidenceLevel.replaceAll("_", " ")}` : ""}
 </div>
 </div>
 <div className="flex flex-wrap gap-2">
 {message.envelope?.provider ? (
 <div className="border border-slate-700/40 bg-[#10141a] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
 {message.envelope.provider.runtimeMode.replaceAll("_", " ")}
 </div>
 ) : null}
 {message.envelope?.requestContext?.chatMode ? (
 <div className="border border-sky-300/20 bg-sky-300/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-sky-300">
 {formatChatModeLabel(message.envelope.requestContext.chatMode)}
 </div>
 ) : null}
 {message.envelope?.requestContext?.persistenceStatus ? (
 <div className="inline-flex items-center gap-1 border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
 <Database className="h-3 w-3" />
 {message.envelope.requestContext.persistenceStatus.replaceAll("_", " ")}
 </div>
 ) : null}
 </div>
 </div>

 <MarkdownContent
 content={message.content || (message.isStreaming ? "Engineering Assistant is preparing the response" : "")}
 isStreaming={message.isStreaming}
 />

 {response && !message.isStreaming ? (
 <ResponseMetadata response={response} warnings={message.envelope?.warnings} />
 ) : null}
 </article>
 );
}


type MarkdownBlock =
 | { type: "heading"; level: number; text: string }
 | { type: "paragraph"; text: string }
 | { type: "unordered-list"; items: string[] }
 | { type: "ordered-list"; items: string[] }
 | { type: "code"; text: string }
 | { type: "formula"; text: string }
 | { type: "table"; headers: string[]; rows: string[][] };

function MarkdownContent({
 content,
 isStreaming,
}: {
 content: string;
 isStreaming?: boolean;
}) {
 const blocks = parseMarkdownBlocks(content);

 return (
 <div className="engineering-markdown text-sm leading-7 text-slate-200">
 {blocks.map((block, index) => renderMarkdownBlock(block, index))}
 {isStreaming ? <StreamingCursor /> : null}
 </div>
 );
}

function parseMarkdownBlocks(content: string): MarkdownBlock[] {
 const lines = content.replace(/\r\n/g, "\n").split("\n");
 const blocks: MarkdownBlock[] = [];
 let index = 0;

 while (index < lines.length) {
 const rawLine = lines[index];
 const line = rawLine.trim();

 if (!line) {
 index += 1;
 continue;
 }

 if (line.startsWith("```") || line.startsWith("~~~")) {
 const fence = line.slice(0, 3);
 index += 1;
 const codeLines: string[] = [];
 while (index < lines.length && !lines[index].trim().startsWith(fence)) {
 codeLines.push(lines[index]);
 index += 1;
 }
 if (index < lines.length) index += 1;
 blocks.push({ type: "code", text: codeLines.join("\n") });
 continue;
 }

 const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
 if (headingMatch) {
 blocks.push({
 type: "heading",
 level: headingMatch[1].length,
 text: headingMatch[2].trim(),
 });
 index += 1;
 continue;
 }

 if (isFormulaLine(line)) {
 const formulaLines: string[] = [stripFormulaDelimiters(line)];
 index += 1;
 while (index < lines.length && isFormulaLine(lines[index].trim())) {
 formulaLines.push(stripFormulaDelimiters(lines[index].trim()));
 index += 1;
 }
 blocks.push({ type: "formula", text: formulaLines.join("\n") });
 continue;
 }

 if (isTableStart(lines, index)) {
 const headers = splitMarkdownTableRow(lines[index]);
 index += 2;
 const rows: string[][] = [];
 while (index < lines.length && looksLikeTableRow(lines[index])) {
 rows.push(splitMarkdownTableRow(lines[index]));
 index += 1;
 }
 blocks.push({ type: "table", headers, rows });
 continue;
 }

 if (/^[-*]\s+/.test(line)) {
 const items: string[] = [];
 while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
 items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
 index += 1;
 }
 blocks.push({ type: "unordered-list", items });
 continue;
 }

 if (/^\d+[.)]\s+/.test(line)) {
 const items: string[] = [];
 while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
 items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ""));
 index += 1;
 }
 blocks.push({ type: "ordered-list", items });
 continue;
 }

 const paragraphLines: string[] = [rawLine.trim()];
 index += 1;
 while (
 index < lines.length &&
 lines[index].trim() &&
 !lines[index].trim().match(/^(#{1,4})\s+(.+)$/) &&
 !/^[-*]\s+/.test(lines[index].trim()) &&
 !/^\d+[.)]\s+/.test(lines[index].trim()) &&
 !isTableStart(lines, index) &&
 !isFormulaLine(lines[index].trim()) &&
 !lines[index].trim().startsWith("```") &&
 !lines[index].trim().startsWith("~~~")
 ) {
 paragraphLines.push(lines[index].trim());
 index += 1;
 }
 blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
 }

 return blocks.length ? blocks : [{ type: "paragraph", text: content }];
}

function renderMarkdownBlock(block: MarkdownBlock, index: number) {
 const key = `${block.type}-${index}`;

 if (block.type === "heading") {
 const className =
 block.level === 1
 ? "mt-6 mb-3 text-xl font-semibold leading-8 text-slate-50 first:mt-0"
 : block.level === 2
 ? "mt-5 mb-2 text-lg font-semibold leading-7 text-slate-50 first:mt-0"
 : "mt-4 mb-2 text-base font-semibold leading-7 text-slate-100 first:mt-0";
 return (
 <div key={key} className={className}>
 {renderInlineMarkdown(block.text)}
 </div>
 );
 }

 if (block.type === "unordered-list") {
 return (
 <ul key={key} className="my-3 ml-5 list-disc space-y-1.5 marker:text-sky-300">
 {block.items.map((item, itemIndex) => (
 <li key={`${key}-${itemIndex}`} className="pl-1">
 {renderInlineMarkdown(item)}
 </li>
 ))}
 </ul>
 );
 }

 if (block.type === "ordered-list") {
 return (
 <ol key={key} className="my-3 ml-5 list-decimal space-y-1.5 marker:text-sky-300">
 {block.items.map((item, itemIndex) => (
 <li key={`${key}-${itemIndex}`} className="pl-1">
 {renderInlineMarkdown(item)}
 </li>
 ))}
 </ol>
 );
 }

 if (block.type === "code") {
 return (
 <pre key={key} className="my-4 overflow-x-auto rounded-xl border border-slate-700/50 bg-[#0a0e14] p-4 font-mono text-xs leading-6 text-slate-200">
 <code>{block.text}</code>
 </pre>
 );
 }

 if (block.type === "formula") {
 return (
 <div key={key} className="my-4 overflow-x-auto rounded-xl border border-sky-300/20 bg-sky-300/5 px-4 py-3 text-center font-mono text-sm text-slate-100">
 {block.text.split("\n").map((line, lineIndex) => (
 <div key={`${key}-${lineIndex}`}>{line}</div>
 ))}
 </div>
 );
 }

 if (block.type === "table") {
 return (
 <div key={key} className="my-4 overflow-x-auto rounded-xl border border-slate-700/40">
 <table className="min-w-full border-collapse text-left text-xs">
 <thead className="bg-slate-800/80 text-slate-100">
 <tr>
 {block.headers.map((header, headerIndex) => (
 <th key={`${key}-h-${headerIndex}`} className="border-b border-slate-700/50 px-3 py-2 font-semibold">
 {renderInlineMarkdown(header)}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {block.rows.map((row, rowIndex) => (
 <tr key={`${key}-r-${rowIndex}`} className="odd:bg-[#10141a] even:bg-[#0d1117]">
 {block.headers.map((_, cellIndex) => (
 <td key={`${key}-c-${rowIndex}-${cellIndex}`} className="border-t border-slate-700/30 px-3 py-2 align-top text-slate-300">
 {renderInlineMarkdown(row[cellIndex] ?? "")}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
 }

 return (
 <p key={key} className="my-3 first:mt-0 last:mb-0">
 {renderInlineMarkdown(block.text)}
 </p>
 );
}

function renderInlineMarkdown(text: string): ReactNode[] {
 const nodes: ReactNode[] = [];
 const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
 let lastIndex = 0;
 let match: RegExpExecArray | null;

 while ((match = pattern.exec(text)) !== null) {
 if (match.index > lastIndex) {
 nodes.push(text.slice(lastIndex, match.index));
 }

 const token = match[0];
 if (token.startsWith("**")) {
 nodes.push(
 <strong key={`strong-${match.index}`} className="font-semibold text-slate-50">
 {token.slice(2, -2)}
 </strong>,
 );
 } else {
 nodes.push(
 <code key={`code-${match.index}`} className="rounded bg-slate-900/80 px-1.5 py-0.5 font-mono text-[0.85em] text-sky-200">
 {token.slice(1, -1)}
 </code>,
 );
 }

 lastIndex = match.index + token.length;
 }

 if (lastIndex < text.length) {
 nodes.push(text.slice(lastIndex));
 }

 return nodes;
}

function isFormulaLine(line: string) {
 return (
 /^\$\$.+\$\$$/.test(line) ||
 /^\\\[.+\\\]$/.test(line) ||
 /^([A-Za-z][A-Za-z0-9_{}^\\ /·*+\-=()\.]+)=/.test(line)
 );
}

function stripFormulaDelimiters(line: string) {
 return line.replace(/^\$\$|\$\$$/g, "").replace(/^\\\[|\\\]$/g, "").trim();
}

function looksLikeTableRow(line: string) {
 const trimmed = line.trim();
 return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.split("|").length >= 3;
}

function isTableStart(lines: string[], index: number) {
 return (
 index + 1 < lines.length &&
 looksLikeTableRow(lines[index]) &&
 /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1])
 );
}

function splitMarkdownTableRow(line: string) {
 return line
 .trim()
 .replace(/^\|/, "")
 .replace(/\|$/, "")
 .split("|")
 .map((cell) => cell.trim());
}

function StreamingCursor() {
 return (
 <span className="ml-1 inline-flex items-center gap-1 align-middle" aria-label="Assistant is typing">
 <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.2s]" />
 <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.1s]" />
 <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300" />
 </span>
 );
}

function ResponseMetadata({
 response,
 warnings,
}: {
 response: EngineeringAIResponse;
 warnings?: string[];
}) {
 const sections = [
 { title: "Assumptions", values: response.assumptions },
 { title: "Missing data", values: response.missingData },
 { title: "Safety warnings", values: response.safetyWarnings },
 { title: "Standards referenced", values: response.standardsReferenced },
 { title: "Provider warnings", values: warnings ?? [] },
 ].filter((section) => section.values.length > 0);

 return (
 <div className="mt-4 space-y-3 border-t border-slate-700/30 pt-4">
 <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest">
 <span className="border border-slate-700/40 bg-[#10141a] px-2 py-1 text-slate-400">
 Professional review: {response.requiresProfessionalReview ? "Required" : "Contextual"}
 </span>
 <span className="border border-slate-700/40 bg-[#10141a] px-2 py-1 text-slate-400">
 Confidence: {response.confidenceLevel.replaceAll("_", " ")}
 </span>
 </div>

 {sections.length ? (
 <div className="grid gap-3 lg:grid-cols-2">
 {sections.map((section) => (
 <div key={section.title} className="border border-slate-700/30 bg-[#10141a] p-3">
 <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
 {section.title}
 </div>
 <ul className="space-y-1 text-xs leading-5 text-slate-400">
 {section.values.map((value) => (
 <li key={value} className="flex gap-2">
 <span className="mt-2 h-1 w-1 flex-shrink-0 bg-sky-300" />
 <span>{value}</span>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 ) : null}
 </div>
 );
}

function LoadingMessage() {
 return (
 <article className="inline-flex max-w-[94%] items-center gap-3 rounded-2xl border border-slate-700/40 bg-[#181c22] px-4 py-3 shadow-lg shadow-black/10">
 <Settings className="h-4 w-4 animate-spin text-sky-300" />
 <div>
 <div className="font-mono text-[10px] uppercase tracking-widest text-sky-300">
 Engineering Assistant is generating
 </div>
 <div className="mt-2 flex items-center gap-1.5" aria-label="Assistant is typing">
 <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s]" />
 <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.1s]" />
 <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
 </div>
 </div>
 </article>
 );
}
