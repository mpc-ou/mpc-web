"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_MEMBERS } from "@/constants/cache";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

const MAX_POSTS = 50;
const WORDS_PER_MINUTE = 200;
const WORD_SPLIT_RE = /\s+/;

export const getMemberBySlug = async (slug: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      "use cache: remote";
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
            where: { post: { status: "PUBLISHED" } },
            include: {
              post: {
                select: {
                  id: true,
                  titleVi: true,
                  titleEn: true,
                  slug: true,
                  thumbnail: true,
                  achievementDate: true,
                  achievementType: true,
                  isHighlight: true,
                  publishedAt: true
                }
              }
            },
            orderBy: { post: { achievementDate: "desc" } }
          },
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  titleEn: true,
                  thumbnail: true,
                  technologies: true,
                  startDate: true,
                  createdAt: true
                }
              }
            }
          },
          authoredPosts: {
            where: { status: "PUBLISHED", type: "BLOG" },
            take: MAX_POSTS,
            orderBy: { publishedAt: "desc" },
            select: {
              id: true,
              titleVi: true,
              titleEn: true,
              slug: true,
              thumbnail: true,
              publishedAt: true,
              contentVi: true
            }
          }
        }
      });

      if (!member) {
        return { member: null };
      }

      const achievements = member.achievementEntries.map((entry) => ({
        role: entry.role,
        prize: entry.prize,
        achievement: {
          id: entry.post.id,
          title: entry.post.titleVi,
          titleEn: entry.post.titleEn,
          date: entry.post.achievementDate ?? entry.post.publishedAt,
          type: entry.post.achievementType,
          isHighlight: entry.post.isHighlight,
          slug: entry.post.slug,
          thumbnail: entry.post.thumbnail
        }
      }));

      const authoredPosts = member.authoredPosts.map(({ contentVi, ...post }) => ({
        ...post,
        readMinutes: Math.max(1, Math.round(contentVi.split(WORD_SPLIT_RE).filter(Boolean).length / WORDS_PER_MINUTE))
      }));

      const { achievementEntries: _entries, ...rest } = member;
      return { member: { ...rest, achievements, authoredPosts } };
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
