"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Link } from "@/configs/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

export function DynamicEventsClient({
  events,
  currentPage,
  totalPages,
}: {
  events: any[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const statusMap: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" }
  > = {
    UPCOMING: { label: "Sắp diễn ra", variant: "default" },
    ONGOING: { label: "Đang diễn ra", variant: "secondary" },
    COMPLETED: { label: "Đã diễn ra", variant: "outline" },
  };

  return (
    <div
      className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      {events.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          Chưa có sự kiện nào được đăng tải.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const statusInfo = statusMap[event.status] || {
              label: event.status,
              variant: "outline",
            };
            const dateStr = event.startAt
              ? new Date(event.startAt).toLocaleDateString("vi-VN")
              : "";

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                  {event.thumbnail ? (
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-4xl text-muted-foreground/30">
                      <ImageIcon className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      variant={statusInfo.variant}
                      className="shadow-xs backdrop-blur-md bg-background/80"
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col grow p-5">
                  <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-3">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{dateStr}</span>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
                    {event.description || "Chưa có mô tả ngắn về sự kiện này."}
                  </p>

                  <div className="mt-auto flex items-center text-sm font-semibold text-primary pt-4 border-t border-border/10">
                    Xem chi tiết
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={currentPage <= 1 || isPending}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (
                p === 1 ||
                p === totalPages ||
                (p >= currentPage - 1 && p <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isPending || currentPage === p}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) {
                return (
                  <span
                    key={p}
                    className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={currentPage >= totalPages || isPending}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
