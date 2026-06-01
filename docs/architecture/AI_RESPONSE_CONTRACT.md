# AI Response Contract

The Engineering GPT assistant should return both user-facing answer text and structured metadata. This prevents engineering caveats from being buried inside prose and allows the UI to consistently show review status, assumptions, missing data, standards references, and safety warnings.

## Contract

```ts
type EngineeringAIResponse = {
 answer: string;
 scopeStatus: "engineering" | "out_of_scope" | "needs_clarification";
 assumptions: string[];
 missingData: string[];
 safetyWarnings: string[];
 standardsReferenced: string[];
 requiresProfessionalReview: boolean;
 confidenceLevel:
 | "rough_estimate"
 | "preliminary"
 | "detailed"
 | "not_applicable";
};
```

## Required behavior

- `answer` contains the user-facing response.
- `scopeStatus` controls whether the UI renders normal engineering output, refusal, or a request for engineering context.
- `assumptions` must be populated for calculations, estimates, preliminary design checks, and technical judgments.
- `missingData` must identify data needed for a reliable answer.
- `safetyWarnings` must include professional-review and safety-critical notices when relevant.
- `standardsReferenced` must identify any standards, codes, or regulations cited by the assistant.
- `requiresProfessionalReview` must be true for safety-critical, regulated, final, construction-ready, or standards/code-sensitive work.
- `confidenceLevel` must clearly distinguish rough estimates, preliminary support, detailed calculations, and non-applicable cases.

## Response contract limitation

This contract is ready for AI-provider integration, but Base instruction enforcement does not call a model. The Base instruction enforcement chat route returns a deterministic contract preview only.
