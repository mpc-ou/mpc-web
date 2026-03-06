import type { MetadataRoute } from "next";
import { prisma } from "@/configs/prisma/db";
import { _LOCALES } from "@/constants/lang";
import { SITE_URL } from "@/constants/seo";

/**
 * Static routes for the sitemap.
 * Add new public pages here when they are created.
 */
const STATIC_ROUTES = [
  "",
  "/about",
  "/events",
  "/members",
  "/projects",
  "/achievements",
  "/sponsors",
  "/training",
  "/activities",
  "/activities/webdesign"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ──────────────────────────────────
  for (const route of STATIC_ROUTES) {
    entries.push({
      url: `${SITE_URL}/vi${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(_LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}${route}`]))
      }
    });
  }

  // ── Dynamic: Events ───────────────────────────────
  try {
    const events = await prisma.event.findMany({
      where: { status: { in: ["UPCOMING", "ONGOING", "COMPLETED"] } },
      select: { slug: true, updatedAt: true },
      orderBy: { startAt: "desc" }
    });

    for (const event of events) {
      entries.push({
        url: `${SITE_URL}/vi/events/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            _LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}/events/${event.slug}`])
          )
        }
      });
    }
  } catch {
    // DB unavailable during build — skip dynamic entries
  }

  // ── Dynamic: Projects ─────────────────────────────
  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" }
    });

    for (const project of projects) {
      entries.push({
        url: `${SITE_URL}/vi/projects/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            _LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}/projects/${project.slug}`])
          )
        }
      });
    }
  } catch {
    // DB unavailable during build — skip dynamic entries
  }

  // ── Dynamic: Members ──────────────────────────────
  try {
    const members = await prisma.member.findMany({
      where: { isActive: true, webRole: { not: "GUEST" } },
      select: { slug: true, updatedAt: true }
    });

    for (const member of members) {
      entries.push({
        url: `${SITE_URL}/vi/members/${member.slug}`,
        lastModified: member.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: {
          languages: Object.fromEntries(
            _LOCALES.map((locale) => [locale, `${SITE_URL}/${locale}/members/${member.slug}`])
          )
        }
      });
    }
  } catch {
    // DB unavailable during build — skip dynamic entries
  }

  return entries;
}
