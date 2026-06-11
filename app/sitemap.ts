import type { MetadataRoute } from "next";
import { prisma } from "@/configs/prisma/db";
import { _LOCALES } from "@/constants/lang";
import { SITE_URL } from "@/constants/seo";

/* ── Helpers ──────────────────────────────────────────────────── */

/** Build { vi: "/vi/...", en: "/en/..." } for bilingual sitemap entries. */
function alternates(path: string): Record<string, string> {
  return Object.fromEntries(_LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]));
}

function buildEntry(
  path: string,
  lastModified: Date,
  priority: number,
  changefreq: MetadataRoute.Sitemap[number]["changeFrequency"]
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/vi${path}`,
    lastModified,
    changeFrequency: changefreq,
    priority,
    alternates: { languages: alternates(path) }
  };
}

/* ── Static routes ────────────────────────────────────────────── */

const STATIC_ROUTES = [
  { path: "", priority: 1.0, changefreq: "weekly" },
  { path: "/about", priority: 0.8, changefreq: "monthly" },
  { path: "/events", priority: 0.8, changefreq: "weekly" },
  { path: "/blogs", priority: 0.8, changefreq: "weekly" },
  { path: "/members", priority: 0.7, changefreq: "monthly" },
  { path: "/projects", priority: 0.7, changefreq: "monthly" },
  { path: "/achievements", priority: 0.7, changefreq: "monthly" },
  { path: "/sponsors", priority: 0.6, changefreq: "monthly" },
  { path: "/training", priority: 0.7, changefreq: "monthly" },
  { path: "/activities", priority: 0.6, changefreq: "monthly" },
  { path: "/activities/webdesign", priority: 0.6, changefreq: "monthly" }
] as const;

/* ── Dynamic section helper ───────────────────────────────────── */

type DynamicSection = {
  /** DB query returning { slug, updatedAt } rows */
  rows: readonly { slug: string; updatedAt: Date }[];
  /** URL prefix e.g. "/events" */
  prefix: string;
  priority: number;
  changefreq: MetadataRoute.Sitemap[number]["changeFrequency"];
};

function addDynamicSection(entries: MetadataRoute.Sitemap, section: DynamicSection) {
  for (const row of section.rows) {
    const path = `${section.prefix}/${row.slug}`;
    entries.push(buildEntry(path, row.updatedAt, section.priority, section.changefreq));
  }
}

/* ── Sitemap ──────────────────────────────────────────────────── */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const now = new Date();
  for (const r of STATIC_ROUTES) {
    entries.push(buildEntry(r.path, now, r.priority, r.changefreq as MetadataRoute.Sitemap[number]["changeFrequency"]));
  }

  // Events (PUBLISHED only)
  try {
    const events = await prisma.post.findMany({
      where: { type: "EVENT", status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { startAt: "desc" }
    });
    addDynamicSection(entries, {
      rows: events,
      prefix: "/events",
      priority: 0.7,
      changefreq: "weekly"
    });
  } catch {
    /* best-effort */
  }

  // Blog posts (PUBLISHED only)
  try {
    const blogs = await prisma.post.findMany({
      where: { type: "BLOG", status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" }
    });
    addDynamicSection(entries, {
      rows: blogs,
      prefix: "/blogs",
      priority: 0.7,
      changefreq: "weekly"
    });
  } catch {
    /* best-effort */
  }

  // Achievements (PUBLISHED only)
  try {
    const achievements = await prisma.post.findMany({
      where: { type: "ACHIEVEMENT", status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { achievementDate: "desc" }
    });
    addDynamicSection(entries, {
      rows: achievements,
      prefix: "/achievements",
      priority: 0.6,
      changefreq: "monthly"
    });
  } catch {
    /* best-effort */
  }

  // Projects (active only)
  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" }
    });
    addDynamicSection(entries, {
      rows: projects,
      prefix: "/projects",
      priority: 0.6,
      changefreq: "monthly"
    });
  } catch {
    /* best-effort */
  }

  // Members (active, non-guest only)
  try {
    const members = await prisma.member.findMany({
      where: { isActive: true, webRole: { not: "GUEST" }, slug: { not: null } },
      select: { slug: true, updatedAt: true }
    });
    addDynamicSection(entries, {
      rows: members as { slug: string; updatedAt: Date }[],
      prefix: "/members",
      priority: 0.5,
      changefreq: "monthly"
    });
  } catch {
    /* best-effort */
  }

  return entries;
}
