# Phase 5 Free Chat Test Cases

## Free chat should not require a project

Request:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "x-engineering-user-id: assistant-page-local-user" \
  -H "x-engineering-user-email: assistant-page-local-user@engineering.local" \
  -d '{"userMessage":"What is thermodynamics?","chatMode":"free_chat"}'
```

Expected:

- HTTP 200
- `requestContext.chatMode = free_chat`
- no `project_access_denied`
- answer is an engineering concept response
- session is saved without `projectId`

## New chat should start a new free ChatSession

Behavior:

- Click New Chat on `/assistant`
- Existing messages are cleared
- `activeSessionId` becomes `null`
- next message creates a new free `ChatSession`

## Project chat should still enforce project access

Request with a project ID that the user does not belong to:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"Review this pump issue","projectId":"not-my-project"}'
```

Expected:

- HTTP 403
- `project_access_denied`

## Free history should load without projectId

```bash
curl http://localhost:3000/api/history \
  -H "x-engineering-user-id: assistant-page-local-user" \
  -H "x-engineering-user-email: assistant-page-local-user@engineering.local"
```

Expected:

- `status = phase_5_free_chat_history_ready`
- returns free chat sessions for the user
