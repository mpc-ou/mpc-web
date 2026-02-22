import type { User } from "@supabase/supabase-js";
import { prisma } from "@/configs/prisma/db";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";

export async function requireAdmin(user?: User) {
  if (!user) {
    throw new Error("Unauthorized");
  }
  const member = await prisma.member.findUnique({ where: { authId: user.id } });
  if (!member || member.webRole !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return member;
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateUniqueSlug(email: string): Promise<string> {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "member";

  const taken = await prisma.member.findUnique({ where: { slug: base } });
  if (!taken) return base;

  for (let i = 0; i < 20; i++) {
    const suffix = Math.floor(Math.random() * 900 + 100).toString();
    const candidate = `${base}${suffix}`;
    const exists = await prisma.member.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
  }
  return `${base}${Date.now().toString().slice(-6)}`;
}

export { prisma, handleErrorServerWithAuth };
