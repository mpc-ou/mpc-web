import Fuse, { type IFuseOptions } from "fuse.js";
import type { SearchIndexItem, SearchSection } from "@/types/search";

const FUSE_OPTIONS: IFuseOptions<SearchIndexItem> = {
  keys: [
    { name: "title", weight: 2 },
    { name: "authorName", weight: 1 },
    { name: "keywords", weight: 1 }
  ],
  threshold: 0.4,
  distance: 100,
  includeScore: true
};

const MAX_PER_SECTION = 5;

export type SearchSuggestions = Record<SearchSection, SearchIndexItem[]>;

export function createFuse(items: SearchIndexItem[]): Fuse<SearchIndexItem> {
  return new Fuse(items, FUSE_OPTIONS);
}

export function searchWithSections(fuse: Fuse<SearchIndexItem>, query: string): SearchSuggestions {
  const results = fuse.search(query);

  const sections: SearchSuggestions = {
    member: [],
    blog: [],
    event: [],
    achievement: [],
    project: []
  };

  for (const { item } of results) {
    const bucket = sections[item.section];
    if (bucket.length < MAX_PER_SECTION) {
      bucket.push(item);
    }
  }

  return sections;
}

export function totalResultCount(sections: SearchSuggestions): number {
  let count = 0;
  for (const key of Object.keys(sections) as SearchSection[]) {
    count += sections[key].length;
  }
  return count;
}
