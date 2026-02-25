import {
  CalendarDays,
  ChevronLeft,
  Globe2,
  MapPin,
  Play,
  Share2,
  Users,
  UserCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/app/[locale]/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { EventJsonLd } from "@/components/seo/json-ld";
import { Link } from "@/configs/i18n/routing";
import { MarkdownContent } from "@/components/markdown-content";
import { generatePageSeo } from "@/utils/seo";
import { getTranslations } from "next-intl/server";
import { EventContentClient } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const { data } = await getEventBySlug(slug);
  // biome-ignore lint/suspicious/noExplicitAny: API response shape is untyped
  const event = (data?.payload as any)?.event;

  if (!event) {
    return { title: "Không tìm thấy sự kiện" };
  }

  return generatePageSeo({
    page: "eventDetail",
    title: event.title,
    description: event.description?.slice(0, 160) || undefined,
    locale: locale || "vi",
    pathname: `/events/${slug}`,
    image: event.thumbnail || undefined,
    type: "article",
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const { data } = await getEventBySlug(slug);
  // biome-ignore lint/suspicious/noExplicitAny: API response shape is untyped
  const event = (data?.payload as any)?.event;

  if (!event) {
    notFound();
  }

  const t = await getTranslations();
  const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://mpc-club.vercel.app"}/${locale || "vi"}/events/${slug}`;

  const statusMap: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" }
  > = {
    UPCOMING: { label: "Sắp diễn ra", variant: "default" },
    ONGOING: { label: "Đang diễn ra", variant: "secondary" },
    COMPLETED: { label: "Đã diễn ra", variant: "outline" },
  };

  const statusInfo = statusMap[event.status as keyof typeof statusMap] ?? {
    label: event.status,
    variant: "outline" as const,
  };

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
      <EventJsonLd
        description={event.description || ""}
        endDate={event.endAt || undefined}
        image={event.thumbnail || undefined}
        location={event.location || undefined}
        name={event.title}
        startDate={event.startAt}
        url={eventUrl}
      />
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
        <ScrollReveal>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge className="px-3 py-1" variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
            {event.type && event.type !== "OTHER" && (
              <Badge
                className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20"
                variant="secondary"
              >
                {t(`events.types.${event.type}` as any) || event.type}
              </Badge>
            )}
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
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-sm">
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
        </ScrollReveal>

        <Separator className="mb-10" />

        {/* ── ARTICLE BODY ── */}
        {event.description ? (
          <ScrollReveal delay={100} variant="fade-up">
            <MarkdownContent content={event.description} />
          </ScrollReveal>
        ) : null}

        {/* ── ORGANIZERS ── */}
        {event.organizers && event.organizers.length > 0 && (
          <ScrollReveal variant="fade-up">
            <section className="mb-14">
              <h2 className="mb-5 border-border border-b pb-2 font-bold text-xl">
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
                      <p className="truncate font-medium text-sm">
                        {org.member.firstName} {org.member.lastName}
                      </p>
                      {org.role && (
                        <p className="truncate text-muted-foreground text-xs">
                          {org.role}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* ── GALLERY ── */}
        {event.gallery && event.gallery.length > 0 && (
          <EventContentClient gallery={event.gallery} />
        )}
      </div>
    </div>
  );
}
