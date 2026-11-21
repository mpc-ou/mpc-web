"use client";

import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useTransition } from "react";
import { cn } from "@/lib/utils";
import { AchievementCard } from "./achievement-card.client";
import { SectionHeading } from "./section-heading";
import { type AchievementPost, POSTS_PER_PAGE } from "./types";

const PREVIEW_COUNT = 4;

type Props = {
  posts: AchievementPost[];
  total: number;
  totalPages: number;
  currentPage: number;
};

const pageList = (current: number, last: number): number[] => {
  const wanted = new Set([1, last, current - 1, current, current + 1].filter((n) => n >= 1 && n <= last));
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: number[] = [];
  for (const [i, n] of sorted.entries()) {
    if (i > 0 && n - sorted[i - 1] > 1) {
      out.push(-n);
    }
    out.push(n);
  }
  return out;
};

export function AchievementPosts({ posts, total, totalPages, currentPage }: Props) {
  const t = useTranslations("achievements");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const sectionRef = useRef<HTMLElement>(null);

  const expanded = searchParams.has("page");
  const visible = expanded ? posts : posts.slice(0, PREVIEW_COUNT);
  const start = expanded ? (currentPage - 1) * POSTS_PER_PAGE + 1 : 1;
  const end = start + visible.length - 1;

  const hrefWith = (page: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === null) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const scrollToTop = () => {
    const el = sectionRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navigate = (page: number | null) => {
    const needsServer = (page ?? 1) !== currentPage;
    if (needsServer) {
      startTransition(() => router.push(hrefWith(page), { scroll: false }));
    } else {
      window.history.pushState(null, "", hrefWith(page));
    }
    scrollToTop();
  };

  return (
    <section className='flex scroll-mt-24 flex-col gap-7' ref={sectionRef}>
      <SectionHeading
        aside={total > 0 ? t("board.range", { start, end, total }) : undefined}
        eyebrow={t("board.postsEyebrow")}
        title={t("articlesTitle")}
      />

      {visible.length === 0 ? (
        <div className='flex flex-col items-center gap-3 py-20 text-center text-muted-foreground'>
          <Trophy className='h-10 w-10 opacity-30' />
          <p>{t("emptyData")}</p>
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            isPending && "pointer-events-none opacity-50"
          )}
          key={`${expanded}-${currentPage}`}
        >
          {visible.map((post, i) => (
            <div
              className='fade-in slide-in-from-bottom-6 animate-in fill-mode-both duration-700 ease-out'
              key={post.id}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <AchievementCard post={post} />
            </div>
          ))}
        </div>
      )}

      {!expanded && total > PREVIEW_COUNT && (
        <button
          className='group inline-flex items-center gap-2 self-center rounded-full border border-border-strong px-6 py-3 font-mono font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-glow-primary'
          onClick={() => navigate(1)}
          type='button'
        >
          {t("board.viewAll", { total })}
          <ChevronDown className='h-4 w-4 transition-transform group-hover:translate-y-0.5' />
        </button>
      )}

      {expanded && (
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <button
            className='inline-flex items-center gap-1.5 py-2 font-mono font-semibold text-muted-foreground text-sm transition-colors hover:text-foreground'
            onClick={() => navigate(null)}
            type='button'
          >
            <ChevronUp className='h-4 w-4' />
            {t("board.collapse")}
          </button>

          {totalPages > 1 && (
            <nav aria-label='pagination' className='flex items-center gap-1.5'>
              <PageButton
                disabled={currentPage <= 1 || isPending}
                label={t("board.prevPage")}
                onClick={() => navigate(currentPage - 1)}
              >
                <ArrowLeft className='h-4 w-4' />
              </PageButton>
              {pageList(currentPage, totalPages).map((p) =>
                p < 0 ? (
                  <span className='w-6 text-center font-mono text-muted-foreground' key={p}>
                    …
                  </span>
                ) : (
                  <PageButton
                    active={p === currentPage}
                    disabled={isPending}
                    key={p}
                    label={t("board.goToPage", { page: p })}
                    onClick={() => navigate(p)}
                  >
                    {p}
                  </PageButton>
                )
              )}
              <PageButton
                disabled={currentPage >= totalPages || isPending}
                label={t("board.nextPage")}
                onClick={() => navigate(currentPage + 1)}
              >
                <ArrowRight className='h-4 w-4' />
              </PageButton>
            </nav>
          )}
        </div>
      )}
    </section>
  );
}

type PageButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

function PageButton({ active, disabled, label, onClick, children }: PageButtonProps) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl border font-bold font-mono text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border-strong hover:-translate-y-0.5 hover:border-primary hover:text-primary"
      )}
      disabled={disabled || active}
      onClick={onClick}
      type='button'
    >
      {children}
    </button>
  );
}
