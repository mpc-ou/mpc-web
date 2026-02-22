"use server";

import { prisma } from "@/configs/prisma/db";

export async function getMemberBySlug(slug: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { slug },
      include: {
        clubRoles: {
          include: { department: true },
          orderBy: { startAt: "desc" }
        },
        achievements: {
          include: { achievement: true },
          take: 6,
          orderBy: { achievement: { date: "desc" } }
        },
        projects: {
          include: { project: true },
          take: 6
        },
        authoredPosts: {
          where: { status: "PUBLISHED" },
          take: 4,
          orderBy: { publishedAt: "desc" }
        }
      }
    });
    return { member };
  } catch {
    return { member: null };
  }
}
