export type AuthType = "local" | "oidc";

export type ProjectRole = "project_admin" | "engineer" | "viewer";

export type GlobalRole = "platform_admin";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  authType: AuthType;
}

export interface ProjectAccess {
  projectId: string;
  projectKey: string;
  projectName: string;
  role: ProjectRole;
  permissions: string[];
}

export interface AuthProfile {
  user: AuthenticatedUser;
  globalRole: GlobalRole | null;
  projects: ProjectAccess[];
}