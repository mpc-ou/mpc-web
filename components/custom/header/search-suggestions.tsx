"use client";

import { Calendar, FileText, FolderKanban, Trophy, User } from "lucide-react";
import type { SearchIndexItem, SearchSection } from "@/types/search";
import type { SearchSuggestions } from "@/utils/fuse-search";

const sectionIcons: Record<SearchSection, typeof User> = {
  member: User,
  blog: FileText,
  event: Calendar,
  achievement: Trophy,
  project: FolderKanban
};

type Props = {
  sections: SearchSuggestions;
  sectionLabels: Record<SearchSection, string>;
  query: string;
};

export function SearchSuggestions({ sections, sectionLabels, query }: Props) {
  const hasAny = Object.values(sections).some((arr) => arr.length > 0);
  if (!hasAny) {
    return null;
  }

  return (
    <div className='max-h-[60vh] overflow-y-auto overscroll-contain border-border border-t'>
      {(Object.keys(sections) as SearchSection[]).map((key) => {
        const items = sections[key];
        if (items.length === 0) {
          return null;
        }

        const Icon = sectionIcons[key];

        return (
          <div className='px-2 py-1.5' key={key}>
            <div className='flex items-center gap-1.5 px-3 py-1 font-medium text-muted-foreground text-xs uppercase tracking-wider'>
              <Icon className='h-3 w-3' />
              {sectionLabels[key]}
            </div>
            {items.map((item) => (
              <SuggestionRow item={item} key={`${item.section}-${item.id}`} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SuggestionRow({ item }: { item: SearchIndexItem }) {
  const isMember = item.section === "member";

  return (
    <a
      className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted'
      href={item.url}
    >
      <span className='h-7 w-7 shrink-0 overflow-hidden rounded-md bg-muted'>
        {item.thumbnail ? (
          // biome-ignore lint/a11y/noImgElement: decorative thumbnail in search suggestions
          <img alt='' className='h-full w-full object-cover' src={item.thumbnail} />
        ) : (
          <span className='flex h-full w-full items-center justify-center text-muted-foreground text-xs'>
            {isMember ? "?" : "—"}
          </span>
        )}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{item.title}</p>
        {isMember && item.extra ? (
          <p className='truncate text-muted-foreground text-xs'>{item.extra}</p>
        ) : item.authorName ? (
          <p className='truncate text-muted-foreground text-xs'>{item.authorName}</p>
        ) : null}
      </div>
    </a>
  );
}
