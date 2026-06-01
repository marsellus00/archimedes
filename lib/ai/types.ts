export type EngineeringScopeStatus =
 | "engineering"
 | "out_of_scope"
 | "needs_clarification";

export type EngineeringConfidenceLevel =
 | "rough_estimate"
 | "preliminary"
 | "detailed"
 | "not_applicable";

export type EngineeringRequestCategory =
 | "engineering_concept"
 | "engineering_allowed"
 | "engineering_calculation"
 | "engineering_documentation"
 | "engineering_troubleshooting"
 | "standards_or_code"
 | "safety_critical"
 | "marine_offshore_naval_architecture"
 | "simulation_or_fea"
 | "out_of_scope"
 | "ambiguous";

export type InstructionRole = "system" | "developer" | "user" | "assistant";

export type InstructionSource =
 | "base_instruction"
 | "product_safety_rules"
 | "project_context"
 | "document_context"
 | "user_message";

export type EngineeringInstructionMessage = {
 role: InstructionRole;
 source: InstructionSource;
 content: string;
};

export type EngineeringProjectContext = {
 projectId?: string;
 projectName?: string;
 discipline?: string;
 jurisdiction?: string;
 standardEdition?: string;
 summary?: string;
 knownConstraints?: string[];
};

export type EngineeringDocumentContext = {
 sourceId?: string;
 sourceName: string;
 pageNumber?: number;
 sectionTitle?: string;
 excerpt: string;
};

export type EngineeringPromptInput = {
 userMessage: string;
 projectContext?: EngineeringProjectContext;
 documentContexts?: EngineeringDocumentContext[];
};

export type EngineeringChatMode = "free_chat" | "project_chat";

export type EngineeringChatRequest = EngineeringPromptInput & {
 sessionId?: string;
 projectId?: string;
 chatMode?: EngineeringChatMode;
 requestId?: string;
 stream?: boolean;
};

export type EngineeringRequestClassification = {
 category: EngineeringRequestCategory;
 scopeStatus: EngineeringScopeStatus;
 requiresProfessionalReview: boolean;
 detectedSignals: string[];
 safetyNotice: string;
};

export type EngineeringAIResponse = {
 answer: string;
 scopeStatus: EngineeringScopeStatus;
 assumptions: string[];
 missingData: string[];
 safetyWarnings: string[];
 standardsReferenced: string[];
 requiresProfessionalReview: boolean;
 confidenceLevel: EngineeringConfidenceLevel;
};

export type AIProviderMode = "mock" | "openai-compatible";

export type AIProviderRuntimeMode =
 | "deterministic_mock"
 | "live_openai_compatible"
 | "live_disabled";

export type AIProviderInfo = {
 providerName: string;
 providerMode: AIProviderMode;
 runtimeMode: AIProviderRuntimeMode;
 model?: string;
 baseUrl?: string;
 liveEnabled: boolean;
 configured: boolean;
};

export type AIProviderUsage = {
 promptTokens?: number;
 completionTokens?: number;
 totalTokens?: number;
};

export type EngineeringAIProviderInput = {
 promptInput: EngineeringPromptInput;
 instructionHierarchy: EngineeringInstructionMessage[];
 classification: EngineeringRequestClassification;
};

export type EngineeringAIProviderResult = {
 response: EngineeringAIResponse;
 provider: AIProviderInfo;
 usage?: AIProviderUsage;
 warnings: string[];
 generatedAt: string;
};

export type EngineeringAIProvider = {
 info: AIProviderInfo;
 generateEngineeringResponse(
 input: EngineeringAIProviderInput,
 ): Promise<EngineeringAIProviderResult>;
 streamEngineeringResponse?(
 input: EngineeringAIProviderInput,
 ): AsyncIterable<string>;
};

export type EngineeringRequestContext = {
 userId?: string;
 projectId?: string;
 chatMode?: EngineeringChatMode;
 chatSessionId?: string;
 persistedUserMessageId?: string;
 persistedAssistantMessageId?: string;
 authenticationStatus:
 | "trusted_header_present"
 | "development_header_present"
 | "auth_not_configured"
 | "required_but_missing";
 persistenceStatus:
 | "database_persisted"
 | "database_not_configured"
 | "database_required_but_missing"
 | "database_error"
 | "database_not_configured";
};

export type EngineeringInstructionPreview = {
 role: InstructionRole;
 source: InstructionSource;
 contentPreviewLength: number;
};

export type EngineeringAIResponseEnvelope = {
 response: EngineeringAIResponse;
 classification: EngineeringRequestClassification;
 instructionHierarchy: Array<EngineeringInstructionMessage | EngineeringInstructionPreview>;
 provider: AIProviderInfo;
 requestContext: EngineeringRequestContext;
 usage?: AIProviderUsage;
 implementationStatus:
 | "contract_only"
 | "ai_provider_ready"
 | "calculation_engine_ready"
 | "database_integrated"
 | "deterministic_fallback"
 | "scope_guarded";
 notes: string[];
 warnings: string[];
};
