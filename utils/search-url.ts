import type { SearchSection } from "@/types/search";

const SECTION_BASE_PATH: Record<SearchSection, string> = {
  member: "/members",
  blog: "/blogs",
  event: "/events",
  achievement: "/achievements",
  project: "/projects"
};

export const getSearchItemUrl = (section: SearchSection, slug: string): string =>
  `${SECTION_BASE_PATH[section]}/${slug}`;
