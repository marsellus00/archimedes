# Phase 5 Rework — Free Chat Sessions + Project Chat Separation

## Goal

Phase 5 now supports two chat modes:

1. **Free Chat** — default user-scoped engineering chat. It creates a `ChatSession` without requiring a `Project`.
2. **Project Chat** — project-scoped chat. It requires a real `projectId`, project membership, and the `write_chat` permission.

This prevents simple engineering concept prompts such as “What is thermodynamics?” from being blocked by project-access checks while preserving project security for real project data.

## Backend behavior

`POST /api/chat` now resolves chat mode as follows:

```txt
If projectId is supplied:
  mode = project_chat
  verify project membership
  save ChatSession with projectId

If projectId is not supplied:
  mode = free_chat
  do not check project membership
  save ChatSession under the user only
```

## Schema update

`ChatSession.projectId` and `ChatMessage.projectId` are optional. `ChatSession.mode` identifies whether the session is `FREE_CHAT` or `PROJECT_CHAT`.

```prisma
model ChatSession {
  projectId String?
  mode      ChatSessionMode @default(FREE_CHAT)
}

enum ChatSessionMode {
  FREE_CHAT
  PROJECT_CHAT
}
```

## Frontend behavior

The `/assistant` page now sends:

```json
{
  "userMessage": "What is thermodynamics?",
  "chatMode": "free_chat"
}
```

It does not send a fake project ID.

## Security boundary

Free chat does not grant access to project files, calculations, document retrieval, project audit records, or project history. Those remain gated behind project membership.

## Still deferred

- Production authentication and authorization remain Phase 6.
- File upload and document retrieval remain Phase 7.
- Project selector UI can be added later so the user can intentionally switch from Free Chat to Project Chat.
