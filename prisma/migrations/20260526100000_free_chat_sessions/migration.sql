-- Phase 5.1 free chat sessions.
-- A new chat can now be user-scoped without belonging to a project.

DO $$
BEGIN
  CREATE TYPE "ChatSessionMode" AS ENUM ('FREE_CHAT', 'PROJECT_CHAT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "chat_sessions"
  ADD COLUMN IF NOT EXISTS "mode" "ChatSessionMode" NOT NULL DEFAULT 'FREE_CHAT';

UPDATE "chat_sessions"
SET "mode" = 'PROJECT_CHAT'
WHERE "project_id" IS NOT NULL;

ALTER TABLE "chat_sessions"
  ALTER COLUMN "project_id" DROP NOT NULL;

ALTER TABLE "chat_messages"
  ALTER COLUMN "project_id" DROP NOT NULL;

DROP INDEX IF EXISTS "chat_sessions_user_id_updated_at_idx";
CREATE INDEX IF NOT EXISTS "chat_sessions_user_id_mode_updated_at_idx"
  ON "chat_sessions"("user_id", "mode", "updated_at");
