export type SearchSection = "member" | "blog" | "event" | "achievement" | "project";

export type SearchIndexItem = {
  id: string;
  title: string;
  slug: string;
  section: SearchSection;
  thumbnail: string | null;
  authorName: string | null;
  keywords: string;
  extra: string | null;
  url: string;
};
