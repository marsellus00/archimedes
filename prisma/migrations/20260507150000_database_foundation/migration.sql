-- Database foundation for Engineering GPT.
-- Requires PostgreSQL. Document retrieval embeddings use pgvector; install pgvector in the database before deploying this migration.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'ENGINEER', 'REVIEWER', 'VIEWER');
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'ON_HOLD');
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL');
CREATE TYPE "CalculationReviewStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'REVIEWED', 'REJECTED');
CREATE TYPE "UploadedFileStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'INDEXED', 'FAILED');

CREATE TABLE "users" (
 "id" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "name" TEXT,
 "role" "WorkspaceRole" NOT NULL DEFAULT 'ENGINEER',
 "external_id" TEXT,
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organizations" (
 "id" TEXT NOT NULL,
 "name" TEXT NOT NULL,
 "owner_id" TEXT,
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
 "id" TEXT NOT NULL,
 "organization_id" TEXT NOT NULL,
 "name" TEXT NOT NULL,
 "description" TEXT,
 "discipline" TEXT,
 "jurisdiction" TEXT,
 "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
 "metadata_json" JSONB NOT NULL DEFAULT '{}',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_members" (
 "id" TEXT NOT NULL,
 "project_id" TEXT NOT NULL,
 "user_id" TEXT NOT NULL,
 "role" "WorkspaceRole" NOT NULL DEFAULT 'VIEWER',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_sessions" (
 "id" TEXT NOT NULL,
 "project_id" TEXT NOT NULL,
 "user_id" TEXT NOT NULL,
 "title" TEXT NOT NULL,
 "metadata_json" JSONB NOT NULL DEFAULT '{}',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
 "id" TEXT NOT NULL,
 "chat_session_id" TEXT NOT NULL,
 "project_id" TEXT NOT NULL,
 "user_id" TEXT,
 "role" "ChatMessageRole" NOT NULL,
 "content" TEXT NOT NULL,
 "metadata_json" JSONB NOT NULL DEFAULT '{}',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "calculations" (
 "id" TEXT NOT NULL,
 "project_id" TEXT NOT NULL,
 "user_id" TEXT NOT NULL,
 "linked_chat_message_id" TEXT,
 "calculation_type" TEXT NOT NULL,
 "objective" TEXT,
 "input_json" JSONB NOT NULL,
 "result_json" JSONB NOT NULL,
 "unit_system" TEXT,
 "assumptions_json" JSONB NOT NULL DEFAULT '[]',
 "warnings_json" JSONB NOT NULL DEFAULT '[]',
 "limitations_json" JSONB NOT NULL DEFAULT '[]',
 "review_status" "CalculationReviewStatus" NOT NULL DEFAULT 'DRAFT',
 "requires_professional_review" BOOLEAN NOT NULL DEFAULT true,
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "calculations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "uploaded_files" (
 "id" TEXT NOT NULL,
 "project_id" TEXT NOT NULL,
 "user_id" TEXT NOT NULL,
 "filename" TEXT NOT NULL,
 "file_type" TEXT NOT NULL,
 "storage_url" TEXT NOT NULL,
 "status" "UploadedFileStatus" NOT NULL DEFAULT 'UPLOADED',
 "metadata_json" JSONB NOT NULL DEFAULT '{}',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "document_chunks" (
 "id" TEXT NOT NULL,
 "uploaded_file_id" TEXT NOT NULL,
 "chunk_text" TEXT NOT NULL,
 "page_number" INTEGER,
 "embedding_vector" vector,
 "metadata_json" JSONB NOT NULL DEFAULT '{}',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
 "id" TEXT NOT NULL,
 "project_id" TEXT,
 "user_id" TEXT,
 "action" TEXT NOT NULL,
 "entity_type" TEXT NOT NULL,
 "entity_id" TEXT,
 "metadata_json" JSONB NOT NULL DEFAULT '{}',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "engineering_standard_references" (
 "id" TEXT NOT NULL,
 "project_id" TEXT,
 "standard" TEXT NOT NULL,
 "edition" TEXT,
 "jurisdiction" TEXT,
 "notes" TEXT,
 "metadata_json" JSONB NOT NULL DEFAULT '{}',
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "engineering_standard_references_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_settings" (
 "id" TEXT NOT NULL,
 "user_id" TEXT NOT NULL,
 "key" TEXT NOT NULL,
 "value_json" JSONB NOT NULL,
 "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "organizations_owner_id_idx" ON "organizations"("owner_id");
CREATE INDEX "projects_organization_id_idx" ON "projects"("organization_id");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");
CREATE INDEX "project_members_user_id_idx" ON "project_members"("user_id");
CREATE INDEX "project_members_project_id_role_idx" ON "project_members"("project_id", "role");
CREATE INDEX "chat_sessions_project_id_updated_at_idx" ON "chat_sessions"("project_id", "updated_at");
CREATE INDEX "chat_sessions_user_id_updated_at_idx" ON "chat_sessions"("user_id", "updated_at");
CREATE INDEX "chat_messages_chat_session_id_created_at_idx" ON "chat_messages"("chat_session_id", "created_at");
CREATE INDEX "chat_messages_project_id_created_at_idx" ON "chat_messages"("project_id", "created_at");
CREATE INDEX "chat_messages_user_id_created_at_idx" ON "chat_messages"("user_id", "created_at");
CREATE INDEX "calculations_project_id_created_at_idx" ON "calculations"("project_id", "created_at");
CREATE INDEX "calculations_user_id_created_at_idx" ON "calculations"("user_id", "created_at");
CREATE INDEX "calculations_calculation_type_idx" ON "calculations"("calculation_type");
CREATE INDEX "uploaded_files_project_id_created_at_idx" ON "uploaded_files"("project_id", "created_at");
CREATE INDEX "uploaded_files_user_id_created_at_idx" ON "uploaded_files"("user_id", "created_at");
CREATE INDEX "uploaded_files_status_idx" ON "uploaded_files"("status");
CREATE INDEX "document_chunks_uploaded_file_id_idx" ON "document_chunks"("uploaded_file_id");
CREATE INDEX "audit_logs_project_id_created_at_idx" ON "audit_logs"("project_id", "created_at");
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "engineering_standard_references_project_id_idx" ON "engineering_standard_references"("project_id");
CREATE INDEX "engineering_standard_references_standard_idx" ON "engineering_standard_references"("standard");
CREATE UNIQUE INDEX "user_settings_user_id_key_key" ON "user_settings"("user_id", "key");

ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_session_id_fkey" FOREIGN KEY ("chat_session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_uploaded_file_id_fkey" FOREIGN KEY ("uploaded_file_id") REFERENCES "uploaded_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "engineering_standard_references" ADD CONSTRAINT "engineering_standard_references_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
