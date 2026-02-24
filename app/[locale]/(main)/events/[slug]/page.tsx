import { marked } from "marked";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronLeft, MapPin, UserCircle } from "lucide-react";
import { getEventBySlug } from "@/app/[locale]/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { sanitizeHtml } from "@/utils/sanitize-html";
import { EventContentClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getEventBySlug(slug);
  // biome-ignore lint/suspicious/noExplicitAny: API response shape is untyped
  const event = (data?.payload as any)?.event;

  if (!event) {
    return { title: "Không tìm thấy sự kiện" };
  }

  return {
    title: `${event.title} | Sự kiện MPC`,
    description:
      event.description?.slice(0, 160) || "Sự kiện của câu lạc bộ MPC",
    openGraph: {
      images: event.thumbnail ? [event.thumbnail] : [],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data } = await getEventBySlug(slug);
  // biome-ignore lint/suspicious/noExplicitAny: API response shape is untyped
  const event = (data?.payload as any)?.event;

  if (!event) {
    notFound();
  }

  const statusMap: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" }
  > = {
    UPCOMING: { label: "Sắp diễn ra", variant: "default" },
    ONGOING: { label: "Đang diễn ra", variant: "secondary" },
    COMPLETED: { label: "Đã diễn ra", variant: "outline" },
  };

  const statusInfo = statusMap[event.status] ?? {
    label: event.status,
    variant: "outline" as const,
  };

  const rawHtml = event.description
    ? marked.parse(event.description, { gfm: true, breaks: true })
    : null;
  const descriptionHtml = rawHtml
    ? typeof rawHtml === "string"
      ? rawHtml
      : await rawHtml
    : null;

  const dateLabel = event.startAt
    ? new Date(event.startAt).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const endDateLabel = event.endAt
    ? new Date(event.endAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO IMAGE ─────────────────────────────────────────────── */}
      {event.thumbnail ? (
        <div className="relative h-[55vh] min-h-90 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={event.title}
            className="h-full w-full object-cover"
            src={event.thumbnail}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-24 sm:h-32" />
      )}

      {/* ── ARTICLE ────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-3xl px-4 pb-24">
        {/* Back link */}
        <div className="py-5">
          <Button
            asChild
            className="-ml-3 text-muted-foreground"
            size="sm"
            variant="ghost"
          >
            <Link href="/events">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Trở lại danh sách sự kiện
            </Link>
          </Button>
        </div>

        {/* Status + tags */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className="px-3 py-1" variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
          {event.tags?.map((t: any) => (
            <Badge className="px-3 py-1" key={t.tag.id} variant="secondary">
              {t.tag.name}
            </Badge>
          ))}
        </div>

        {/* Title */}
        <h1 className="mb-5 font-bold text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
          {event.title}
        </h1>

        {/* Byline — date & location */}
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {dateLabel && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary/60" />
              {dateLabel}
              {endDateLabel && <> — {endDateLabel}</>}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
              {event.location}
            </span>
          )}
        </div>

        <Separator className="mb-10" />

        {/* ── ARTICLE BODY ── */}
        {descriptionHtml ? (
          <article
            className="prose prose-neutral dark:prose-invert max-w-none mb-14
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-base prose-p:my-4
              prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
              prose-a:text-primary prose-a:underline-offset-4
              prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground
              prose-li:my-1 prose-ul:my-4 prose-ol:my-4
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(descriptionHtml) }}
          />
        ) : null}

        {/* ── ORGANIZERS ── */}
        {event.organizers && event.organizers.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 border-b border-border pb-2 font-bold text-xl">
              Ban tổ chức
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {event.organizers.map((org: any) => (
                <div className="flex items-center gap-3" key={org.id}>
                  {org.member.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={`${org.member.firstName} ${org.member.lastName}`}
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-border"
                      src={org.member.avatar}
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {org.member.firstName} {org.member.lastName}
                    </p>
                    {org.role && (
                      <p className="truncate text-xs text-muted-foreground">
                        {org.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── GALLERY ── */}
        {event.gallery && event.gallery.length > 0 && (
          <EventContentClient gallery={event.gallery} />
        )}
      </div>
    </div>
  );
}
