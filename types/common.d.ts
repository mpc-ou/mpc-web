export type UserProfileData = {
  fullName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  webRole: WebRole;
  slug: string | null;
} | null;

export type WebRole = "ADMIN" | "COLLABORATOR" | "MEMBER" | "GUEST";

import type { Project } from "@/configs/prisma/generated/prisma/models";

export type ProjectSummary = Pick<
  Project,
  "id" | "title" | "slug" | "description" | "thumbnail" | "technologies"
>;

export type SocialItem = {
  icon: string;
  platform: string;
  url: string;
  prefix: string;
  label: string;
};
