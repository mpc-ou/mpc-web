import { prisma } from "@/configs/prisma/db";
import type { WebRole } from "@/types/common";

export type BlogPermissionLevel = "EVERYONE" | "ONLY_IN_CLUB" | "MODS" | "ADMIN";

/**
 * Get the current blog creation permission level from DB SiteSettings.
 * Default: "ONLY_IN_CLUB"
 */
export async function getBlogPermissionLevel(): Promise<BlogPermissionLevel> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "blog_creation_permission" }
  });
  const val = (setting?.value ?? "ONLY_IN_CLUB") as BlogPermissionLevel;
  if (!["EVERYONE", "ONLY_IN_CLUB", "MODS", "ADMIN"].includes(val)) {
    return "ONLY_IN_CLUB";
  }
  return val;
}

/**
 * Role hierarchy for permission checking.
 */
const ROLE_HIERARCHY: Record<WebRole, number> = {
  GUEST: 0,
  MEMBER: 1,
  COLLABORATOR: 2,
  ADMIN: 3
};

/**
 * Check if a webRole has permission to create blog posts based on the
 * current BLOG_CREATION_PERMISSION setting.
 */
export function hasBlogCreationPermission(webRole: WebRole, level: BlogPermissionLevel): boolean {
  const roleLevel = ROLE_HIERARCHY[webRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[levelToRole(level)] ?? 0;
  return roleLevel >= requiredLevel;
}

function levelToRole(level: BlogPermissionLevel): WebRole {
  switch (level) {
    case "EVERYONE":
      return "GUEST";
    case "ONLY_IN_CLUB":
      return "MEMBER";
    case "MODS":
      return "COLLABORATOR";
    case "ADMIN":
      return "ADMIN";
    default:
      return "GUEST";
  }
}
