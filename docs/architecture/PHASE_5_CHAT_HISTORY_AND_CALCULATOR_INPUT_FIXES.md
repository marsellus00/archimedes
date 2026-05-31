# Phase 5.2 — Chat History and Calculator Input Fixes

## Purpose

This patch fixes two usability gaps discovered during local testing:

1. Calculator number fields initialized with `0` appended typed values, producing entries such as `05` instead of replacing the initial zero.
2. The AI Assistant free-chat page did not restore the active chat after navigation and did not surface saved chat history directly on the assistant page.

## Calculator input fix

The shared calculation workspace and the legacy fluid dynamics input component now select the entire numeric value on focus. This lets the first typed digit replace the current default value. For example, clicking into a field showing `0` and typing `5` now produces `5`, not `05`.

Updated files:

- `components/calculators/calculation-workspace.tsx`
- `components/fluid-dynamics-page.tsx`

## Assistant chat persistence fix

The assistant page now:

- Loads recent user-scoped free chat sessions from `/api/history`.
- Restores the active free chat session from `localStorage` when the user navigates away and returns.
- Falls back to the most recent saved free chat session when no active session is stored.
- Stores the active chat session ID after `/api/chat` returns a persisted `chatSessionId`.
- Allows users to click recent chat history chips to restore older conversations.
- Keeps `New chat` behavior correct by clearing the active session and starting a new free `ChatSession` on the next message.

## API addition

`GET /api/history?sessionId=<id>` now returns a full chat session with messages, scoped as follows:

- Without `projectId`: loads a user-scoped `FREE_CHAT` session.
- With `projectId`: loads a project-scoped `PROJECT_CHAT` session after verifying project membership.

## Safety and access model

Free chat remains user-scoped and does not grant access to project documents, project calculations, or project audit data. Project chat still requires a real `projectId` and project membership.

## Review notes

Run locally:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Manual checks:

1. Open `/calculators/fluid-dynamics`, click a field with `0`, type `5`, and confirm the field shows `5`.
2. Open `/assistant`, ask a question, navigate to `/calculators`, return to `/assistant`, and confirm the conversation restores.
3. Click **New chat**, send a new prompt, then confirm both the old and new chat appear in recent free chat history.
