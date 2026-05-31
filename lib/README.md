# Library Modules

The `lib/` directory contains server/client-safe application logic that should not be embedded directly inside page components.

## Current modules

- `ai/`: Base.txt loading, instruction hierarchy, provider abstraction, response contracts, and provider adapters.
- `calculations/`: Phase 4 deterministic engineering calculation modules.
- `safety/`: Scope classification, contextual notices, prompt-injection boundaries, and response wording guardrails.
- `validation/`: Response validation helpers.

## Calculation principle

The AI should explain, structure, question, and document engineering work. Deterministic calculation modules should compute implemented numeric outputs.

Current calculation modules:

- `fluid/pressureDrop.ts`: Darcy-Weisbach straight-pipe pressure-drop calculation.
- `fluid/reynolds.ts`: Reynolds number and flow-regime classification.
- `fluid/frictionFactor.ts`: Laminar, transitional, and turbulent Darcy friction-factor methods.
- `fluid/schemas.ts`: Input normalization and validation.
- `common/resultTypes.ts`: Shared calculation result contract.
- `units/convert.ts`: Unit conversion helpers.
