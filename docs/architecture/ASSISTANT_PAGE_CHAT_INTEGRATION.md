# Assistant Page Chat Integration

## Purpose

The `/assistant` route is now a focused live chat workspace connected to the Phase 3 `/api/chat` endpoint.

## Fixes in this update

- The assistant route now hides the generic right rail so the chat has the full workspace width.
- The global topbar placeholder actions are hidden on `/assistant`.
- The assistant page uses a fixed-height viewport layout under the topbar so the composer remains visible.
- The message composer is a larger multi-line textarea with a visible `Send message` button.
- Secondary controls are placed below the text area and no longer compete with typing space.
- Pressing Enter sends the message; Shift + Enter adds a new line.
- The `New chat` button clears the local conversation state.
- Provider status is loaded from `GET /api/chat`.
- Messages are sent to `POST /api/chat` with a Phase 3 development user header.

## Deferred controls

Attachment, calculation tool, document context, and voice controls are displayed as secondary actions but remain deferred until their planned phases. They show a notice instead of pretending to perform unavailable work.

## Boundaries

This UI does not add production authentication, database persistence, document retrieval, or deterministic calculation tools. Those remain scheduled for later phases.
