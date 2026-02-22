export type UserProfileData = {
  fullName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  webRole: WebRole;
  slug: string | null;
} | null;

export type WebRole = "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";
