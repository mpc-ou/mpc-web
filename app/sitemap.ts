import type { MetadataRoute } from "next";
import { getSitemapData } from "@/app/_actions/main";
import { _LOCALES } from "@/constants/lang";
import { SITE_URL } from "@/constants/seo";

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

type DynamicSection = {
  rows: readonly { slug: string; updatedAt: Date }[];
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const now = new Date();
  for (const r of STATIC_ROUTES) {
    entries.push(buildEntry(r.path, now, r.priority, r.changefreq as MetadataRoute.Sitemap[number]["changeFrequency"]));
  }

  const { data } = await getSitemapData();
  const payload = data?.payload as
    | {
        events: Array<{ slug: string; updatedAt: Date }>;
        blogs: Array<{ slug: string; updatedAt: Date }>;
        achievements: Array<{ slug: string; updatedAt: Date }>;
        projects: Array<{ slug: string; updatedAt: Date }>;
        members: Array<{ slug: string; updatedAt: Date }>;
      }
    | undefined;

  if (payload) {
    addDynamicSection(entries, {
      rows: payload.events,
      prefix: "/events",
      priority: 0.7,
      changefreq: "weekly"
    });
    addDynamicSection(entries, {
      rows: payload.blogs,
      prefix: "/blogs",
      priority: 0.7,
      changefreq: "weekly"
    });
    addDynamicSection(entries, {
      rows: payload.achievements,
      prefix: "/achievements",
      priority: 0.6,
      changefreq: "monthly"
    });
    addDynamicSection(entries, {
      rows: payload.projects,
      prefix: "/projects",
      priority: 0.6,
      changefreq: "monthly"
    });
    addDynamicSection(entries, {
      rows: payload.members,
      prefix: "/members",
      priority: 0.5,
      changefreq: "monthly"
    });
  }

  return entries;
}
