"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import type { PostCardData } from "@/components/post-card";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  startAt: string | undefined;
  status: string | null;
  type: string | null;
  eventType: string | null;
};

export function DynamicEventsClient({
  events,
  currentPage,
  totalPages
}: {
  events: EventListItem[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("events");

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const statusMap: Record<string, { labelKey: string; variant: "default" | "secondary" | "outline" }> = {
    UPCOMING: { labelKey: "status.upcoming", variant: "default" },
    ONGOING: { labelKey: "status.ongoing", variant: "secondary" },
    COMPLETED: { labelKey: "status.completed", variant: "outline" }
  };

  const cards: PostCardData[] = events.map((event) => {
    const statusInfo = statusMap[event.status ?? ""] || { labelKey: "", variant: "outline" as const };
    const statusLabel = statusInfo.labelKey ? t(statusInfo.labelKey as Parameters<typeof t>[0]) : (event.status ?? "");
    const displayType = (event.type === "EVENT" ? event.eventType : event.type) || event.eventType;
    const eventTypeLabel =
      displayType && displayType !== "OTHER"
        ? t(`types.${displayType}` as Parameters<typeof t>[0]) || displayType
        : null;

    return {
      id: event.id,
      slug: event.slug,
      variant: "event",
      titleVi: event.title,
      summaryVi: event.description,
      thumbnail: event.thumbnail,
      date: event.startAt,
      statusBadge: { label: statusLabel, variant: statusInfo.variant },
      eventTypeBadge: eventTypeLabel,
      readMoreLabel: t("viewDetails")
    };
  });

  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      {events.length === 0 ? (
        <div className='py-20 text-center text-muted-foreground'>{t("emptyData")}</div>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {cards.map((card) => (
            <PostCard data={card} key={card.id} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className='mt-12 flex items-center justify-center gap-2'>
          <Button
            className='h-8 w-8 p-0'
            disabled={currentPage <= 1 || isPending}
            onClick={() => handlePageChange(currentPage - 1)}
            size='sm'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-1'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                return (
                  <Button
                    className='h-8 w-8 p-0'
                    disabled={isPending || currentPage === p}
                    key={p}
                    onClick={() => handlePageChange(p)}
                    size='sm'
                    variant={currentPage === p ? "default" : "outline"}
                  >
                    {p}
                  </Button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) {
                return (
                  <span className='flex h-8 w-8 items-center justify-center text-muted-foreground text-sm' key={p}>
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          <Button
            className='h-8 w-8 p-0'
            disabled={currentPage >= totalPages || isPending}
            onClick={() => handlePageChange(currentPage + 1)}
            size='sm'
            variant='outline'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
