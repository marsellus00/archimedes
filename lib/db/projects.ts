import { type NextRequest } from "next/server";
import { type Project, type ProjectMember, type User, type WorkspaceRole } from "@/lib/generated/prisma/client";
import { getEngineeringRequestUser } from "@/lib/auth/requestContext";
import { tryLogAuditEvent } from "@/lib/db/audit";
import { databaseUnavailableError, ApiError } from "@/lib/db/errors";
import { getDatabaseConfigurationStatus, prisma } from "@/lib/db/prisma";
import { toJsonSafe } from "@/lib/db/serialization";

export type ProjectPermission =
 | "view_project"
 | "write_chat"
 | "run_calculation"
 | "upload_file"
 | "review_calculation"
 | "manage_project"
 | "delete_project";

const ROLE_PERMISSIONS: Record<WorkspaceRole, Set<ProjectPermission>> = {
 OWNER: new Set([
 "view_project",
 "write_chat",
 "run_calculation",
 "upload_file",
 "review_calculation",
 "manage_project",
 "delete_project",
 ]),
 ADMIN: new Set([
 "view_project",
 "write_chat",
 "run_calculation",
 "upload_file",
 "review_calculation",
 "manage_project",
 ]),
 ENGINEER: new Set(["view_project", "write_chat", "run_calculation", "upload_file"]),
 REVIEWER: new Set(["view_project", "write_chat", "run_calculation", "review_calculation"]),
 VIEWER: new Set(["view_project"]),
};

export type ProjectAccessContext = {
 user: User;
 project: Project;
 membership: ProjectMember;
};

export type UserAccessContext = {
 user: User;
 authenticationStatus:
 | "trusted_header_present"
 | "development_header_present"
 | "required_but_missing";
};

export function assertDatabaseReady() {
 if (!getDatabaseConfigurationStatus().configured) {
 throw databaseUnavailableError();
 }
}

export async function resolveUserContextFromRequest(
 request: NextRequest,
): Promise<UserAccessContext> {
 assertDatabaseReady();
 const requestUser = getEngineeringRequestUser(request);

 if (requestUser.authenticationStatus === "required_but_missing" || !requestUser.email) {
 throw new ApiError(
 401,
 "Authenticated user context is required. The database-backed routes expect auth provider context or trusted gateway headers.",
 "authentication_required",
 );
 }

 const user = await getOrCreateUser(requestUser);

 return {
 user,
 authenticationStatus: requestUser.authenticationStatus,
 };
}

export async function resolveAccessContextFromRequest(
 request: NextRequest,
 options: { projectId?: string; permission: ProjectPermission },
): Promise<ProjectAccessContext> {
 assertDatabaseReady();
 const requestUser = getEngineeringRequestUser(request);

 if (requestUser.authenticationStatus === "required_but_missing" || !requestUser.email) {
 throw new ApiError(
 401,
 "Authenticated user context is required. The database-backed routes expect auth provider context or trusted gateway headers.",
 "authentication_required",
 );
 }

 const user = await getOrCreateUser(requestUser);
 const projectId = options.projectId || request.nextUrl.searchParams.get("projectId") || undefined;

 if (!projectId) {
 const fallbackProject = await getOrCreateDefaultProjectForUser(user);
 return requireProjectPermission(user.id, fallbackProject.id, options.permission);
 }

 return requireProjectPermission(user.id, projectId, options.permission);
}

export async function getOrCreateUser(input: {
 id?: string;
 email: string;
 name?: string;
}): Promise<User> {
 return prisma.user.upsert({
 where: { email: input.email },
 update: {
 name: input.name,
 externalId: input.id,
 },
 create: {
 email: input.email,
 name: input.name,
 externalId: input.id,
 },
 });
}

export async function getOrCreateDefaultProjectForUser(user: User): Promise<Project> {
 const existingMembership = await prisma.projectMember.findFirst({
 where: { userId: user.id },
 include: { project: true },
 orderBy: { createdAt: "asc" },
 });

 if (existingMembership) {
 return existingMembership.project;
 }

 const organization = await prisma.organization.create({
 data: {
 name: `${user.name || user.email} Workspace`,
 ownerId: user.id,
 },
 });

 const project = await prisma.project.create({
 data: {
 organizationId: organization.id,
 name: "Default Engineering Project",
 description:
 "Auto-created default project used until the user creates a dedicated project.",
 discipline: "General Engineering",
 metadataJson: toJsonSafe({ createdBy: "default_project" }),
 members: {
 create: {
 userId: user.id,
 role: "OWNER",
 },
 },
 },
 });

 await tryLogAuditEvent({
 action: "project.default_created",
 entityType: "project",
 entityId: project.id,
 userId: user.id,
 projectId: project.id,
 });

 return project;
}

export async function requireProjectPermission(
 userId: string,
 projectId: string,
 permission: ProjectPermission,
): Promise<ProjectAccessContext> {
 const membership = await prisma.projectMember.findUnique({
 where: { projectId_userId: { projectId, userId } },
 include: { project: true, user: true },
 });

 if (!membership) {
 throw new ApiError(
 403,
 "You do not have access to this project.",
 "project_access_denied",
 );
 }

 if (!ROLE_PERMISSIONS[membership.role as WorkspaceRole].has(permission)) {
 throw new ApiError(
 403,
 `Your project role (${membership.role}) cannot perform ${permission}.`,
 "project_permission_denied",
 );
 }

 return {
 user: membership.user,
 project: membership.project,
 membership,
 };
}

export async function listProjectsForRequest(request: NextRequest) {
 assertDatabaseReady();
 const requestUser = getEngineeringRequestUser(request);
 if (!requestUser.email) {
 throw new ApiError(401, "Authenticated user context is required.", "authentication_required");
 }
 const user = await getOrCreateUser(requestUser);

 const memberships = await prisma.projectMember.findMany({
 where: { userId: user.id },
 include: { project: { include: { organization: true } } },
 orderBy: { createdAt: "asc" },
 });

 if (memberships.length === 0) {
 const project = await getOrCreateDefaultProjectForUser(user);
 const access = await requireProjectPermission(user.id, project.id, "view_project");
 return [access.membership];
 }

 return memberships;
}

export async function createProjectForRequest(
 request: NextRequest,
 body: {
 name?: string;
 description?: string;
 discipline?: string;
 jurisdiction?: string;
 organizationName?: string;
 },
) {
 assertDatabaseReady();
 const requestUser = getEngineeringRequestUser(request);
 if (!requestUser.email) {
 throw new ApiError(401, "Authenticated user context is required.", "authentication_required");
 }

 const name = body.name?.trim();
 if (!name) {
 throw new ApiError(400, "Project name is required.", "project_name_required");
 }

 const user = await getOrCreateUser(requestUser);
 const organization = await prisma.organization.create({
 data: {
 name: body.organizationName?.trim() || `${name} Organization`,
 ownerId: user.id,
 },
 });

 const project = await prisma.project.create({
 data: {
 organizationId: organization.id,
 name,
 description: body.description,
 discipline: body.discipline,
 jurisdiction: body.jurisdiction,
 members: {
 create: {
 userId: user.id,
 role: "OWNER",
 },
 },
 },
 include: { organization: true, members: true },
 });

 await tryLogAuditEvent({
 action: "project.created",
 entityType: "project",
 entityId: project.id,
 userId: user.id,
 projectId: project.id,
 metadata: { name: project.name, discipline: project.discipline },
 });

 return project;
}
