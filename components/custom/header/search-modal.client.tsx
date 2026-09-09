"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSearchIndex } from "@/app/_actions/main";
import type { SearchSection } from "@/types/search";
import { createFuse, searchWithSections, totalResultCount } from "@/utils/fuse-search";
import { SearchSuggestions } from "./search-suggestions";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const SECTION_LABEL_KEYS: Record<SearchSection, string> = {
  member: "member",
  blog: "blog",
  event: "event",
  achievement: "achievement",
  project: "project"
};

const SearchModal = () => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("header");
  const tn = useTranslations("header.nav");
  const ts = useTranslations("header.searchSections");

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [indexLoaded, setIndexLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 700);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchWithSections> | null>(null);

  const fuseRef = useRef<ReturnType<typeof createFuse> | null>(null);

  const sectionLabels: Record<SearchSection, string> = useMemo(
    () => ({
      member: ts(SECTION_LABEL_KEYS.member),
      blog: ts(SECTION_LABEL_KEYS.blog),
      event: ts(SECTION_LABEL_KEYS.event),
      achievement: ts(SECTION_LABEL_KEYS.achievement),
      project: ts(SECTION_LABEL_KEYS.project)
    }),
    [ts]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadIndex = useCallback(async () => {
    if (fuseRef.current) {
      return;
    }
    const items = await getSearchIndex(locale);
    fuseRef.current = createFuse(items);
    setIndexLoaded(true);
  }, [locale]);

  useEffect(() => {
    if (open && !fuseRef.current) {
      loadIndex();
    }
  }, [open, loadIndex]);

  useEffect(() => {
    if (!(fuseRef.current && debouncedQuery.trim())) {
      setSuggestions(null);
      return;
    }
    const result = searchWithSections(fuseRef.current, debouncedQuery.trim());
    setSuggestions(result);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setSuggestions(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const trimmed = query.trim();
  const hasSuggestions = suggestions && totalResultCount(suggestions) > 0;
  const showEmpty = suggestions && totalResultCount(suggestions) === 0 && debouncedQuery.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) {
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    close();
  };

  const overlay = open && mounted && (
    <div className='fixed inset-0 z-50 flex items-start justify-center pt-[12vh]'>
      <button
        aria-label='Close search'
        className='fixed inset-0 bg-black/50 backdrop-blur-sm'
        onClick={close}
        type='button'
      />

      <div className='relative z-10 w-full max-w-xl px-4'>
        <form className='overflow-hidden rounded-2xl border border-border bg-card shadow-2xl' onSubmit={handleSubmit}>
          <div className='flex items-center gap-3 px-4 py-3.5'>
            <Search className='h-5 w-5 shrink-0 text-muted-foreground' />
            <input
              autoComplete='off'
              className='flex-1 border-0 bg-transparent text-foreground text-lg outline-hidden placeholder:text-muted-foreground/60'
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              ref={inputRef}
              type='text'
              value={query}
            />
            <kbd className='hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs sm:inline-block'>
              ESC
            </kbd>
          </div>

          {!indexLoaded && query.trim().length > 0 && (
            <div className='border-border border-t px-4 py-4 text-center text-muted-foreground text-xs'>
              {t("searchLoading")}
            </div>
          )}

          {showEmpty && (
            <div className='border-border border-t px-4 py-6 text-center text-muted-foreground text-sm'>
              {t("searchNoResults")}
            </div>
          )}

          {hasSuggestions && <SearchSuggestions sectionLabels={sectionLabels} sections={suggestions} />}
        </form>

        {trimmed && (
          <p className='mt-3 text-center text-muted-foreground/60 text-xs'>
            {t("searchViewAll")} &quot;{trimmed}&quot; —{" "}
            <button className='underline hover:text-foreground' onClick={handleSubmit} type='button'>
              Enter
            </button>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-label={tn("search")}
        className='flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={() => setOpen(true)}
        type='button'
      >
        <Search className='h-4 w-4' />
      </button>

      {overlay && createPortal(overlay, document.body)}
    </>
  );
};

export { SearchModal };
