"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

export const getMemberBySlug = async (slug: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache";
      cacheTag(_CACHE_MEMBERS);

      const member = await prisma.member.findFirst({
        where: {
          OR: [{ slug }, { studentId: slug }, { id: slug }]
        },
        include: {
          clubRoles: {
            include: { department: true },
            orderBy: { startAt: "desc" }
          },
          achievementEntries: {
            include: { post: true },
            take: 6,
            orderBy: { post: { achievementDate: "desc" } }
          },
          projects: {
            include: {
              project: {
                include: {
                  members: {
                    include: {
                      member: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          middleName: true,
                          avatar: true,
                          slug: true
                        }
                      }
                    }
                  }
                }
              }
            },
            take: 6
          },
          authoredPosts: {
            where: { status: "PUBLISHED", type: "BLOG" },
            take: 4,
            orderBy: { publishedAt: "desc" }
          }
        }
      });

      if (!member) {
        return { member: null };
      }

      // Remap achievementEntries → achievements, post → achievement
      const achievements = member.achievementEntries.map((entry) => ({
        role: entry.role,
        prize: entry.prize,
        achievement: {
          id: entry.post.id,
          title: entry.post.titleVi,
          date: entry.post.achievementDate,
          type: entry.post.achievementType,
          isHighlight: entry.post.isHighlight,
          slug: entry.post.slug,
          thumbnail: entry.post.thumbnail
        }
      }));

      return { member: { ...member, achievements } };
    }
  });

export const getMemberSlugByAuthId = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      const member = await prisma.member.findUnique({
        where: { id: user?.id },
        select: { slug: true }
      });
      return { slug: member?.slug ?? null };
    }
  });
