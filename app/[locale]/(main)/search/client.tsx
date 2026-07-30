"use client";

import { Calendar, FileText, FolderKanban, Search, Trophy, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FtsRow } from "@/app/_actions/main";
import { searchAll } from "@/app/_actions/main";
import type { SearchSection } from "@/types/search";

const SECTION_ICONS: Record<SearchSection, typeof User> = {
  member: User,
  blog: FileText,
  event: Calendar,
  achievement: Trophy,
  project: FolderKanban
};

const SECTION_TABS: { key: SearchSection | "all"; labelKey: string }[] = [
  { key: "all", labelKey: "all" },
  { key: "member", labelKey: "member" },
  { key: "blog", labelKey: "blog" },
  { key: "event", labelKey: "event" },
  { key: "achievement", labelKey: "achievement" },
  { key: "project", labelKey: "project" }
];

type Props = {
  initialQuery: string;
  locale: string;
};

export function SearchClient({ initialQuery, locale: _locale }: Props) {
  const t = useTranslations("header");
  const tn = useTranslations("header.nav");
  const ts = useTranslations("header.searchSections");
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchSection | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [query, router]
  );

  const sectionLabelMap: Record<string, string> = {
    all: tn("search"),
    member: ts("member"),
    blog: ts("blog"),
    event: ts("event"),
    achievement: ts("achievement"),
    project: ts("project")
  };

  const buildUrl = (section: SearchSection, slug: string) => {
    const map: Record<SearchSection, string> = {
      member: "/members",
      blog: "/posts",
      event: "/posts",
      achievement: "/posts",
      project: "/projects"
    };
    return `${map[section]}/${slug}`;
  };

  return (
    <div className='min-h-[60vh] px-4 py-16'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='mb-8 text-center font-bold text-3xl tracking-tight'>{tn("search")}</h1>

        <form className='mb-10' onSubmit={handleSubmit}>
          <div className='relative'>
            <Search className='pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
            <input
              autoComplete='off'
              className='w-full rounded-2xl border border-border bg-card py-4 pr-4 pl-12 text-foreground text-lg shadow-sm outline-hidden transition-all duration-200 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:shadow-md'
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              ref={inputRef}
              type='text'
              value={query}
            />
          </div>
        </form>

        {initialQuery ? (
          <SearchResults
            activeTab={activeTab}
            buildUrl={buildUrl}
            initialQuery={initialQuery}
            locale={_locale}
            sectionLabelMap={sectionLabelMap}
            setActiveTab={setActiveTab}
            t={t}
          />
        ) : (
          <p className='text-center text-muted-foreground text-sm'>{t("searchHint")}</p>
        )}
      </div>
    </div>
  );
}

function SearchResults({
  initialQuery,
  activeTab,
  setActiveTab,
  sectionLabelMap,
  buildUrl,
  locale,
  t
}: {
  initialQuery: string;
  activeTab: SearchSection | "all";
  setActiveTab: (tab: SearchSection | "all") => void;
  sectionLabelMap: Record<string, string>;
  buildUrl: (section: SearchSection, slug: string) => string;
  locale: string;
  t: ReturnType<typeof useTranslations<"header">>;
}) {
  // biome-ignore lint/suspicious/noExplicitAny: FtsRow from server action
  const [results, setResults] = useState<Record<SearchSection, any[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchAll(initialQuery, locale)
      .then((data) => {
        if (cancelled) {
          return;
        }
        setResults(data as Record<SearchSection, FtsRow[]>);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialQuery, locale]);

  if (loading) {
    return (
      <div className='space-y-4'>
        {["sk-1", "sk-2", "sk-3"].map((key) => (
          <div className='animate-pulse rounded-xl border border-border bg-card p-5' key={key}>
            <div className='mb-2 h-4 w-32 rounded bg-muted' />
            <div className='h-3 w-64 rounded bg-muted' />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-16 text-center'>
        <p className='text-muted-foreground text-sm'>{t("searchError") ?? "Có lỗi xảy ra khi tìm kiếm."}</p>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  if (total === 0) {
    return (
      <div className='py-16 text-center'>
        <p className='text-lg text-muted-foreground'>{t("searchNoResults")}</p>
      </div>
    );
  }

  const visibleSections =
    activeTab === "all" ? (Object.keys(results) as SearchSection[]).filter((k) => results[k].length > 0) : [activeTab];

  return (
    <div>
      <p className='mb-4 text-muted-foreground'>
        {t("searchResultsFor")}: <strong className='text-foreground'>&quot;{initialQuery}&quot;</strong> ({total})
      </p>

      <div className='mb-6 flex flex-wrap gap-1.5'>
        {SECTION_TABS.map((tab) => {
          const count = tab.key === "all" ? total : (results[tab.key]?.length ?? 0);
          return (
            <button
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              type='button'
            >
              {sectionLabelMap[tab.labelKey]}
              <span className='text-xs opacity-70'>{count}</span>
            </button>
          );
        })}
      </div>

      <div className='space-y-8'>
        {visibleSections.map((section) => {
          const items = results[section] as FtsRow[];
          const Icon = SECTION_ICONS[section];
          return (
            <section key={section}>
              <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
                <Icon className='h-4 w-4' />
                <h2 className='font-semibold text-sm uppercase tracking-wider'>{sectionLabelMap[section]}</h2>
              </div>
              <div className='space-y-2'>
                {items.map((item) => (
                  <a
                    className='flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:border-primary/30 hover:bg-muted/50'
                    href={buildUrl(section, item.slug)}
                    key={`${section}-${item.id}`}
                  >
                    <span className='relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted'>
                      {item.thumbnail ? (
                        <Image alt='' className='object-cover' fill sizes='40px' src={item.thumbnail} />
                      ) : (
                        <span className='flex h-full w-full items-center justify-center text-muted-foreground'>
                          <Icon className='h-4 w-4' />
                        </span>
                      )}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <h3 className='truncate font-medium'>{item.title}</h3>
                      <p className='mt-0.5 line-clamp-2 text-muted-foreground text-sm'>
                        {item.extra ?? item.summary ?? item.author_name ?? ""}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
