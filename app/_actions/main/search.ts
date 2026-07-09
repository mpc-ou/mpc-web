"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { Prisma } from "@/configs/prisma/generated/prisma/client";
import { _CACHE_MEMBERS, _CACHE_POSTS, _CACHE_PROJECTS } from "@/constants/cache";
import type { SearchIndexItem, SearchSection } from "@/types/search";

export async function getSearchIndex(locale: string): Promise<SearchIndexItem[]> {
  "use cache";
  cacheTag(_CACHE_POSTS, _CACHE_PROJECTS, _CACHE_MEMBERS);

  const isVi = locale === "vi";

  const [posts, projects, members] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        type: true,
        slug: true,
        titleVi: true,
        titleEn: true,
        thumbnail: true,
        author: { select: { firstName: true, lastName: true, middleName: true } },
        tags: { select: { tag: { select: { name: true } } } }
      }
    }),
    prisma.project.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        thumbnail: true,
        description: true,
        descriptionEn: true
      }
    }),
    prisma.member.findMany({
      where: {
        isActive: true,
        webRole: { in: ["ADMIN", "COLLABORATOR", "MEMBER"] }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        avatar: true,
        slug: true,
        joinedClubAt: true,
        clubRoles: {
          select: {
            term: true,
            department: { select: { nameVi: true, nameEn: true } }
          },
          orderBy: { startAt: "desc" },
          take: 1
        }
      }
    })
  ]);

  const items: SearchIndexItem[] = [];

  for (const p of posts) {
    const tagNames = p.tags.map((pt: { tag: { name: string } }) => pt.tag.name).join(" ");
    items.push({
      id: p.id,
      title: isVi ? p.titleVi : p.titleEn || p.titleVi,
      slug: p.slug,
      section: p.type.toLowerCase() as SearchIndexItem["section"],
      thumbnail: p.thumbnail,
      authorName: p.author ? `${p.author.firstName} ${p.author.lastName}` : null,
      keywords: tagNames,
      extra: null,
      url: `/posts/${p.slug}`
    });
  }

  for (const p of projects) {
    items.push({
      id: p.id,
      title: isVi ? p.title : p.titleEn || p.title,
      slug: p.slug,
      section: "project",
      thumbnail: p.thumbnail,
      authorName: null,
      keywords: "",
      extra: null,
      url: `/projects/${p.slug}`
    });
  }

  for (const m of members) {
    const latestRole = m.clubRoles[0];
    const deptName = latestRole?.department
      ? isVi
        ? latestRole.department.nameVi
        : latestRole.department.nameEn || latestRole.department.nameVi
      : null;
    const extraParts: string[] = [];
    if (deptName) {
      extraParts.push(deptName);
    }
    if (latestRole?.term) {
      extraParts.push(`K${latestRole.term}`);
    } else if (m.joinedClubAt) {
      extraParts.push(String(new Date(m.joinedClubAt).getFullYear()));
    }

    items.push({
      id: m.id,
      title: `${m.firstName} ${m.lastName}`,
      slug: m.slug ?? m.id,
      section: "member",
      thumbnail: m.avatar,
      authorName: null,
      keywords: "",
      extra: extraParts.length > 0 ? extraParts.join(" · ") : null,
      url: `/members/${m.slug ?? m.id}`
    });
  }

  return items;
}

export type FtsRow = {
  section: string;
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  author_name: string | null;
  summary: string | null;
  extra: string | null;
  rank: number;
};

export type SearchAllResult = Record<SearchSection, FtsRow[]>;

export async function searchAll(query: string, locale: string): Promise<SearchAllResult> {
  const isVi = locale === "vi";

  const titleCol = isVi ? `"titleVi"` : `coalesce(nullif("titleEn",''), "titleVi")`;
  const summaryCol = isVi ? `"summaryVi"` : `coalesce(nullif("summaryEn",''), "summaryVi")`;

  // tsvector gồm: title (A) + summary (B) + author name + tags (C) — KHÔNG có content (markdown quá nặng)
  const postVector = isVi
    ? `setweight(to_tsvector('simple', coalesce("titleVi",'')), 'A')
       || setweight(to_tsvector('simple', coalesce("summaryVi",'')), 'B')
       || setweight(to_tsvector('simple', coalesce(au."firstName",'') || ' ' || coalesce(au."lastName",'') || ' ' || coalesce(tg.names,'')), 'C')`
    : `setweight(to_tsvector('simple', coalesce("titleEn",'') || ' ' || coalesce("titleVi",'')), 'A')
       || setweight(to_tsvector('simple', coalesce("summaryEn",'') || ' ' || coalesce("summaryVi",'')), 'B')
       || setweight(to_tsvector('simple', coalesce(au."firstName",'') || ' ' || coalesce(au."lastName",'') || ' ' || coalesce(tg.names,'')), 'C')`;

  const projVector = `setweight(to_tsvector('simple', coalesce(proj.title,'') || ' ' || coalesce(proj."titleEn",'')), 'A')
    || setweight(to_tsvector('simple', coalesce(proj.description,'') || ' ' || coalesce(proj."descriptionEn",'')), 'B')`;

  const memberVector = `setweight(to_tsvector('simple', coalesce(m."firstName",'') || ' ' || coalesce(m."lastName",'')), 'A')
    || setweight(to_tsvector('simple', coalesce(m.bio,'') || ' ' || coalesce(m."studentId",'')), 'B')`;

  const rows = await prisma.$queryRaw<FtsRow[]>(Prisma.sql`
    SELECT section, id, title, slug, thumbnail, author_name, summary, extra, rank FROM (
      SELECT 'blog' AS section,
        p.id, ${Prisma.raw(titleCol)} AS title,
        p.slug, p.thumbnail,
        concat(au."firstName", ' ', au."lastName") AS author_name,
        ${Prisma.raw(summaryCol)} AS summary,
        NULL AS extra,
        ts_rank(${Prisma.raw(postVector)}, plainto_tsquery('simple', ${query})) AS rank
      FROM "Post" p
      JOIN "Member" au ON au.id = p."authorId"
      LEFT JOIN LATERAL (
        SELECT string_agg(t.name, ' ') AS names
        FROM "PostTag" pt
        JOIN "Tag" t ON t.id = pt."tagId"
        WHERE pt."postId" = p.id
      ) tg ON TRUE
      WHERE p.status = 'PUBLISHED' AND p.type = 'BLOG'
        AND ${Prisma.raw(postVector)} @@ plainto_tsquery('simple', ${query})

      UNION ALL

      SELECT 'event' AS section,
        p.id, ${Prisma.raw(titleCol)} AS title,
        p.slug, p.thumbnail,
        concat(au."firstName", ' ', au."lastName") AS author_name,
        ${Prisma.raw(summaryCol)} AS summary,
        NULL AS extra,
        ts_rank(${Prisma.raw(postVector)}, plainto_tsquery('simple', ${query})) AS rank
      FROM "Post" p
      JOIN "Member" au ON au.id = p."authorId"
      LEFT JOIN LATERAL (
        SELECT string_agg(t.name, ' ') AS names
        FROM "PostTag" pt
        JOIN "Tag" t ON t.id = pt."tagId"
        WHERE pt."postId" = p.id
      ) tg ON TRUE
      WHERE p.status = 'PUBLISHED' AND p.type = 'EVENT'
        AND ${Prisma.raw(postVector)} @@ plainto_tsquery('simple', ${query})

      UNION ALL

      SELECT 'achievement' AS section,
        p.id, ${Prisma.raw(titleCol)} AS title,
        p.slug, p.thumbnail,
        concat(au."firstName", ' ', au."lastName") AS author_name,
        ${Prisma.raw(summaryCol)} AS summary,
        NULL AS extra,
        ts_rank(${Prisma.raw(postVector)}, plainto_tsquery('simple', ${query})) AS rank
      FROM "Post" p
      JOIN "Member" au ON au.id = p."authorId"
      LEFT JOIN LATERAL (
        SELECT string_agg(t.name, ' ') AS names
        FROM "PostTag" pt
        JOIN "Tag" t ON t.id = pt."tagId"
        WHERE pt."postId" = p.id
      ) tg ON TRUE
      WHERE p.status = 'PUBLISHED' AND p.type = 'ACHIEVEMENT'
        AND ${Prisma.raw(postVector)} @@ plainto_tsquery('simple', ${query})

      UNION ALL

      SELECT 'project' AS section,
        proj.id,
        ${isVi ? Prisma.raw("proj.title") : Prisma.raw(`coalesce(nullif(proj."titleEn",''), proj.title)`)},
        proj.slug, proj.thumbnail,
        NULL AS author_name,
        ${isVi ? Prisma.raw("proj.description") : Prisma.raw(`coalesce(nullif(proj."descriptionEn",''), proj.description)`)} AS summary,
        NULL AS extra,
        ts_rank(${Prisma.raw(projVector)}, plainto_tsquery('simple', ${query})) AS rank
      FROM "Project" proj
      WHERE proj."isActive" = TRUE
        AND ${Prisma.raw(projVector)} @@ plainto_tsquery('simple', ${query})

      UNION ALL

      SELECT 'member' AS section,
        m.id,
        concat(m."firstName", ' ', m."lastName") AS title,
        coalesce(m.slug, m.id) AS slug,
        m.avatar AS thumbnail,
        NULL AS author_name,
        m.bio AS summary,
        concat(
          coalesce(${isVi ? Prisma.raw(`d."nameVi"`) : Prisma.raw(`coalesce(nullif(d."nameEn",''), d."nameVi")`)}, ''),
          CASE WHEN cr.term IS NOT NULL THEN ' · K' || cr.term::text
               WHEN m."joinedClubAt" IS NOT NULL THEN ' · ' || extract(year from m."joinedClubAt")::text
               ELSE '' END
        ) AS extra,
        ts_rank(${Prisma.raw(memberVector)}, plainto_tsquery('simple', ${query})) AS rank
      FROM "Member" m
      LEFT JOIN LATERAL (
        SELECT cr2."departmentId", cr2.term
        FROM "ClubRole" cr2
        WHERE cr2."memberId" = m.id
        ORDER BY cr2."startAt" DESC
        LIMIT 1
      ) cr ON TRUE
      LEFT JOIN "Department" d ON d.id = cr."departmentId"
      WHERE m."isActive" = TRUE AND m."webRole" IN ('ADMIN', 'COLLABORATOR', 'MEMBER')
        AND ${Prisma.raw(memberVector)} @@ plainto_tsquery('simple', ${query})
    ) sub
    ORDER BY rank DESC
    LIMIT 50
  `);

  const result: SearchAllResult = {
    member: [],
    blog: [],
    event: [],
    achievement: [],
    project: []
  };

  for (const row of rows) {
    const key = row.section as SearchSection;
    result[key].push(row);
  }

  return result;
}
