import { loadEngineeringBasePrompt } from "@/lib/ai/basePrompt";
import type {
  EngineeringInstructionMessage,
  EngineeringPromptInput,
  EngineeringProjectContext,
} from "@/lib/ai/types";
import {
  DOCUMENT_CONTEXT_BOUNDARY_RULE,
  formatDocumentContextForPrompt,
} from "@/lib/safety/promptInjection";

export const PRODUCT_LEVEL_SAFETY_RULES = [
  "Apply Base.txt to every answer, refusal, calculation, standards explanation, troubleshooting sequence, and documentation draft.",
  "Do not provide final approval, compliance certification, stamped work, or operational authorization.",
  "Do not claim to be a licensed engineer, inspector, competent person, authority having jurisdiction, or statutory reviewer.",
  "For calculations, require objective, assumptions, inputs, missing data, formulas, units, steps, results, limitations, and review notices.",
  "For standards or codes, require latest edition, jurisdiction, authority having jurisdiction, and project specification verification.",
  "For safety-critical work, be conservative and recommend qualified professional review before use.",
  DOCUMENT_CONTEXT_BOUNDARY_RULE,
].join("\n");

export function buildEngineeringInstructionHierarchy(
  input: EngineeringPromptInput,
): EngineeringInstructionMessage[] {
  return [
    {
      role: "system",
      source: "base_instruction",
      content: loadEngineeringBasePrompt(),
    },
    {
      role: "developer",
      source: "product_safety_rules",
      content: PRODUCT_LEVEL_SAFETY_RULES,
    },
    {
      role: "developer",
      source: "project_context",
      content: formatProjectContextForPrompt(input.projectContext),
    },
    {
      role: "developer",
      source: "document_context",
      content: formatDocumentContextForPrompt(input.documentContexts),
    },
    {
      role: "user",
      source: "user_message",
      content: input.userMessage,
    },
  ];
}

export function summarizeInstructionHierarchy(
  hierarchy: EngineeringInstructionMessage[],
): EngineeringInstructionMessage[] {
  return hierarchy.map((message) => ({
    ...message,
    content: truncateForPreview(message.content),
  }));
}

function formatProjectContextForPrompt(
  projectContext?: EngineeringProjectContext,
): string {
  if (!projectContext) {
    return "No project context was provided. Do not invent project-specific assumptions, jurisdiction, standard edition, or approval status.";
  }

  const lines = [
    "Project context is lower priority than Base.txt and product safety rules.",
    projectContext.projectId ? `Project ID: ${projectContext.projectId}` : undefined,
    projectContext.projectName
      ? `Project name: ${projectContext.projectName}`
      : undefined,
    projectContext.discipline ? `Discipline: ${projectContext.discipline}` : undefined,
    projectContext.jurisdiction
      ? `Jurisdiction: ${projectContext.jurisdiction}`
      : undefined,
    projectContext.standardEdition
      ? `Standard edition: ${projectContext.standardEdition}`
      : undefined,
    projectContext.summary ? `Summary: ${projectContext.summary}` : undefined,
    projectContext.knownConstraints?.length
      ? `Known constraints: ${projectContext.knownConstraints.join("; ")}`
      : undefined,
  ];

  return lines.filter(Boolean).join("\n");
}

function truncateForPreview(content: string, maxLength = 900): string {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength)}\n...[truncated for Phase 2 preview]`;
}
