"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Mic,
  Paperclip,
  Plus,
  Send,
  Settings,
  Sigma,
  Database,
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
  { label: "Attach file", icon: Paperclip, note: "Phase 7 file upload" },
  { label: "Calculation", icon: Sigma, note: "Phase 4 calculation modules active at /calculators" },
  { label: "Document context", icon: FileText, note: "Phase 7 retrieval" },
  { label: "Voice", icon: Mic, note: "Later enhancement" },
];

const ASSISTANT_REVIEW_HEADERS = {
  "Content-Type": "application/json",
  "x-engineering-user-id": "assistant-page-local-user",
  "x-engineering-user-email": "assistant-page-local-user@engineering.local",
  "x-engineering-user-name": "Assistant Page Local User",
};

const ACTIVE_FREE_CHAT_SESSION_KEY = "engineering-gpt.active-free-chat-session-id";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 260)}px`;
    });
  }

  function resetComposer() {
    setInput("");
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = "132px";
    });
  }

  async function loadChatHistory(options?: { restoreActiveSession?: boolean }) {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const response = await fetch("/api/history", {
        method: "GET",
        headers: ASSISTANT_REVIEW_HEADERS,
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
            ? window.localStorage.getItem(ACTIVE_FREE_CHAT_SESSION_KEY)
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
        headers: ASSISTANT_REVIEW_HEADERS,
      });
      const data = (await response.json()) as HistoryEnvelope;

      if (!response.ok || data.error || !data.session) {
        throw new Error(data.error ?? data.message ?? "Could not load chat session.");
      }

      setMessages(restoreMessagesFromSession(data.session));
      setActiveSessionId(data.session.id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACTIVE_FREE_CHAT_SESSION_KEY, data.session.id);
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

    setMessages((current) => [...current, userEntry]);
    resetComposer();
    setError(null);
    setToolNotice(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: ASSISTANT_REVIEW_HEADERS,
        body: JSON.stringify({
          userMessage,
          chatMode: "free_chat",
          sessionId: activeSessionId ?? undefined,
        }),
      });

      const data = (await response.json()) as ChatEnvelope & { error?: string };

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "The chat request failed.");
      }

      if (data.requestContext?.chatSessionId) {
        setActiveSessionId(data.requestContext.chatSessionId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            ACTIVE_FREE_CHAT_SESSION_KEY,
            data.requestContext.chatSessionId,
          );
        }
      }

      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content: data.response.answer,
          envelope: data,
          createdAt: new Date().toISOString(),
        },
      ]);

      void loadChatHistory({ restoreActiveSession: false });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unknown chat error.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          role: "assistant",
          content:
            "I could not complete that chat request. Check the AI provider configuration and try again.",
          envelope: {
            response: {
              answer:
                "I could not complete that chat request. Check the AI provider configuration and try again.",
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
          createdAt: new Date().toISOString(),
        },
      ]);
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

  function startNewChat() {
    setMessages([]);
    setActiveSessionId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACTIVE_FREE_CHAT_SESSION_KEY);
    }
    setError(null);
    setToolNotice(null);
    resetComposer();
    textareaRef.current?.focus();
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] min-h-0 flex-col overflow-hidden bg-transparent text-slate-200">
      <header className="shrink-0 border-b border-slate-700/30 bg-[#0d1117]/70 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
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
            <p className="mt-1 max-w-4xl text-sm text-slate-400">
              Free engineering chat connected to /api/chat. Ask engineering concept questions without selecting a project,
              or use it for calculations support, troubleshooting, standards questions, safety reviews, and technical documentation drafts.
            </p>
          </div>

          <button
            type="button"
            onClick={startNewChat}
            className="inline-flex w-fit items-center gap-2 border border-sky-300/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-sky-300 transition hover:bg-sky-300/10"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {providerStatus?.selectionWarnings?.length ? (
          <div className="mt-3 border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
            {providerStatus.selectionWarnings.join(" ")}
          </div>
        ) : null}

        <div className="mt-3 border border-slate-700/30 bg-[#10141a]/80 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <Clock3 className="h-3.5 w-3.5 text-sky-300" />
              Recent free chat history
            </div>
            <button
              type="button"
              onClick={() => loadChatHistory({ restoreActiveSession: false })}
              className="text-[10px] font-bold uppercase tracking-widest text-sky-300 hover:underline"
            >
              Refresh
            </button>
          </div>

          {historyError ? (
            <div className="border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
              {historyError}
            </div>
          ) : null}

          {isLoadingHistory && !chatHistory.length ? (
            <div className="text-xs text-slate-500">Loading saved chats...</div>
          ) : null}

          {!isLoadingHistory && !historyError && chatHistory.length === 0 ? (
            <div className="text-xs text-slate-500">
              No saved free chats yet. Your first completed chat will appear here.
            </div>
          ) : null}

          {chatHistory.length ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {chatHistory.slice(0, 8).map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => loadChatSession(session.id)}
                  className={`min-w-[190px] border px-3 py-2 text-left transition ${
                    activeSessionId === session.id
                      ? "border-sky-300/50 bg-sky-300/10"
                      : "border-slate-700/40 bg-[#0a0e14] hover:border-sky-300/30"
                  }`}
                >
                  <div className="truncate text-xs font-semibold text-slate-200">
                    {session.title}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {new Date(session.updatedAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center py-8">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex rounded-full border border-sky-300/20 bg-sky-300/5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-sky-300">
                  Free engineering chat ready · Project not required
                </div>
                <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
                  Start a technical engineering conversation
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Ask a direct engineering question, paste rough data, or request a documentation draft.
                  This creates a free ChatSession under your user identity; project access is required only when a real project is selected later.
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
              {isSending ? <LoadingMessage /> : null}
              <div ref={scrollRef} />
            </div>
          )}
        </section>

        <section className="shrink-0 border-t border-slate-700/30 bg-[#10141a]/98 px-4 py-4 shadow-[0_-18px_50px_rgba(0,0,0,0.32)] backdrop-blur sm:px-6 lg:px-8">
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

            <div className="border border-slate-700/50 bg-[#0a0e14] transition focus-within:border-sky-300 focus-within:ring-1 focus-within:ring-sky-300/40">
              <label htmlFor="engineering-chat-input" className="sr-only">
                Engineering chat message
              </label>
              <textarea
                ref={textareaRef}
                id="engineering-chat-input"
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => resizeComposer(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={6}
                placeholder="Describe the engineering problem, calculation, equipment issue, standard/code question, or documentation task..."
                className="h-[132px] max-h-[260px] min-h-[132px] w-full resize-none border-0 bg-transparent p-4 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {secondaryActions.map(({ label, icon: Icon, note }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setToolNotice(`${label} is reserved for ${note}. Chat is active now.`)}
                    className="inline-flex items-center gap-2 border border-slate-700/40 bg-[#181c22] px-3 py-2 text-xs text-slate-400 transition hover:border-sky-300/30 hover:text-sky-200"
                    title={note}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Enter sends · Shift + Enter adds a line
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="inline-flex min-w-36 items-center justify-center gap-2 bg-sky-300 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#003259] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
                >
                  {isSending ? "Sending" : "Send message"}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
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
              {message.envelope.requestContext.chatMode.replaceAll("_", " ")}
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

      <div className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{message.content}</div>

      {response ? <ResponseMetadata response={response} warnings={message.envelope?.warnings} /> : null}
    </article>
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
    <article className="max-w-[94%] border border-slate-700/40 bg-[#181c22] p-4">
      <div className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-sky-300">
        <Settings className="h-4 w-4 animate-spin" />
        Engineering Assistant is responding
      </div>
      <div className="space-y-2">
        <div className="h-3 w-2/3 animate-pulse bg-slate-700/60" />
        <div className="h-3 w-1/2 animate-pulse bg-slate-700/60" />
      </div>
    </article>
  );
}
