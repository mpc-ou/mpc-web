import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Star,
  UserCircle,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getEventBySlug, getRecentEvents } from "@/app/_actions/main";
import { MarkdownContent } from "@/components/markdown-content";
import { PostGalleryPanel } from "@/components/post-gallery-panel.client";
import { EventJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";
import { generatePageSeo } from "@/utils/seo";

type Props = { params: Promise<{ slug: string; locale: string }> };

function fmtDate(iso: string | null, locale = "vi") {
  if (!iso) {
    return null;
  }
  return formatLocalDate(iso, locale, "d MMMM, yyyy");
}

function fmtDateShort(iso: string | null, locale = "vi") {
  if (!iso) {
    return null;
  }
  return formatLocalDate(iso, locale, "dd/MM/yyyy");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const { data } = await getEventBySlug(slug, locale);
  // biome-ignore lint/suspicious/noExplicitAny: API shape
  const event = (data?.payload as any)?.event;
  if (!event) {
    const tSeo = await getTranslations({ locale, namespace: "seo.notFound" });
    return { title: tSeo("event") };
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
}: Props): Promise<React.ReactNode> {
  const { slug, locale } = await params;

  const [{ data }, { data: recentData }, t] = await Promise.all([
    getEventBySlug(slug, locale),
    getRecentEvents(4, locale),
    getTranslations({ locale, namespace: "events" }),
  ]);

  // biome-ignore lint/suspicious/noExplicitAny: API shape
  const event = (data?.payload as any)?.event;
  if (!event) {
    notFound();
  }

  const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://mpc-club.vercel.app"}/${locale || "vi"}/events/${slug}`;

  // biome-ignore lint/suspicious/noExplicitAny: API shape
  const recentEvents = ((recentData?.payload as any)?.events ?? [])
    .filter((e: any) => e.slug !== slug)
    .slice(0, 3);

  const dateLabel = fmtDate(event.startAt, locale);
  const displayType =
    (event.type === "EVENT" ? event.eventType : event.type) || event.eventType;

  // Combine gallery images: thumbnail, content images, and additional images
  const thumbnail = event.thumbnail ? [event.thumbnail] : [];
  const contentImages: string[] = [];
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  let match;
  imgRegex.lastIndex = 0;
  while ((match = imgRegex.exec(event.content || "")) !== null) {
    if (match[1]) {
      contentImages.push(match[1]);
    }
  }
  const additionalImages =
    event.gallery && event.gallery.length > 0
      ? event.gallery
          .filter((g: any) => g.type === "ADDITIONAL")
          .map((g: any) => g.url)
      : Array.isArray(event.images)
        ? event.images
        : [];

  const allImages = Array.from(
    new Set([...thumbnail, ...contentImages, ...additionalImages]),
  ).filter(Boolean);

  const galleryData =
    event.gallery && event.gallery.length > 0 ? event.gallery : allImages;
  const hasGallery = galleryData.length > 0;

  // ── Bilingual helpers ──
  const displayLocation =
    locale === "en" && event.locationEn
      ? event.locationEn
      : event.locationVi || "";

  const statusMap: Record<string, { label: string; color: string }> = {
    UPCOMING: {
      label: t("status.upcoming"),
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    ONGOING: {
      label: t("status.ongoing"),
      color: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    COMPLETED: {
      label: t("status.completed"),
      color: "bg-muted text-muted-foreground border-border",
    },
    CANCELLED: {
      label: t("status.cancelled"),
      color: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <EventJsonLd
        description={event.description || ""}
        endDate={event.endAt || undefined}
        image={event.thumbnail || undefined}
        location={displayLocation || undefined}
        name={event.title}
        startDate={event.startAt}
        url={eventUrl}
      />

      {/* ── HERO ── */}
      {event.thumbnail ? (
        <div className="relative h-[30vh] min-h-56 w-full overflow-hidden">
          {/* biome-ignore lint/performance/noImgElement: hero image */}
          {/* biome-ignore lint/correctness/useImageSize: size from CSS */}
          <img
            alt={event.title}
            className="h-full w-full object-cover"
            src={event.thumbnail}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-20 sm:h-28" />
      )}

      <div className="container mx-auto max-w-7xl px-4 pb-24">
        {/* Back */}
        <div className="py-5">
          <Button
            asChild
            className="-ml-3 text-muted-foreground"
            size="sm"
            variant="ghost"
          >
            <Link href="/events">
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
        </div>

        <ScrollReveal>
          {/* Badges */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Badge className="px-3 py-1" variant="outline">
              {t("badgeLabel")}
            </Badge>
            {event.status && (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 font-medium text-xs ${statusMap[event.status]?.color ?? ""}`}
              >
                {statusMap[event.status]?.label ?? event.status}
              </span>
            )}
            {displayType && displayType !== "OTHER" && (
              <Badge
                className="border-none bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20"
                variant="outline"
              >
                {t(`types.${displayType}` as any) || displayType}
              </Badge>
            )}
            {event.tags?.map((tTag: any) => (
              <Badge
                className="border-none bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20"
                key={tTag.tag.id}
                variant="outline"
              >
                #{tTag.tag.name || tTag.tag.nameVi}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="mb-6 font-black text-3xl text-foreground leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            {event.title}
          </h1>

          {/* Byline: author + date */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-border/60 border-y py-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-3">
              {event.creator?.avatar ? (
                // biome-ignore lint/performance/noImgElement: avatar
                // biome-ignore lint/correctness/useImageSize: CSS controlled
                <img
                  alt={getFullName(
                    event.creator.firstName,
                    event.creator.lastName,
                    locale,
                  )}
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                  src={event.creator.avatar}
                />
              ) : (
                <UserCircle className="h-10 w-10 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <span className="block font-semibold text-foreground text-sm leading-none">
                  {getFullName(
                    event.creator?.firstName,
                    event.creator?.lastName,
                    locale,
                  )}
                </span>
                {event.creator?.slug && (
                  <Link
                    className="mt-1 block text-muted-foreground text-xs hover:text-primary hover:underline"
                    href={`/members/${event.creator.slug}` as "/"}
                  >
                    @{event.creator.slug}
                  </Link>
                )}
              </div>
            </div>
            {dateLabel && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
                {dateLabel}
              </span>
            )}
          </div>

          {/* Description / lead */}
          {event.description && (
            <p className="mb-10 border-primary border-l-4 pl-4 font-medium text-foreground/80 text-xl leading-relaxed">
              {event.description}
            </p>
          )}
        </ScrollReveal>

        <Separator className="mb-10" />

        {/* ── BODY + SIDEBAR ── */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="min-w-0 flex-1">
            {/* Event info card */}
            <ScrollReveal className="mb-8">
              <div className="space-y-3 rounded-xl border bg-muted/30 p-5">
                <h2 className="font-bold text-muted-foreground text-sm uppercase tracking-wider">
                  {t("infoTitle")}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {displayLocation && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                      <div>
                        <p className="font-medium text-muted-foreground text-xs">
                          {t("locationLabel")}
                        </p>
                        <p className="font-semibold text-foreground text-sm">
                          {displayLocation}
                        </p>
                        {event.latitude && event.longitude && (
                          <a
                            className="text-[10px] text-primary hover:underline"
                            href={`https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}&zoom=17`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {t("viewOnMap")} ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {event.startAt && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                      <div>
                        <p className="font-medium text-muted-foreground text-xs">
                          {t("timeLabel")}
                        </p>
                        <p className="font-semibold text-foreground text-sm">
                          {fmtDateShort(event.startAt, locale)}
                          {event.endAt
                            ? ` – ${fmtDateShort(event.endAt, locale)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sponsors */}
                {event.sponsorships && event.sponsorships.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                      {t("sponsorsTitle")}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      {event.sponsorships.map((s: any) => (
                        <div key={s.id}>
                          {s.sponsor.logo ? (
                            // biome-ignore lint/performance/noImgElement: sponsor logo
                            // biome-ignore lint/correctness/useImageSize: CSS
                            <img
                              alt={s.sponsor.name}
                              className="h-8 w-auto max-w-24 object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                              src={s.sponsor.logo}
                            />
                          ) : (
                            <span className="font-semibold text-muted-foreground text-sm">
                              {s.sponsor.name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Markdown content */}
            {event.content && (
              <ScrollReveal delay={200} variant="fade-up">
                <MarkdownContent content={event.content} />
              </ScrollReveal>
            )}
          </div>

          {/* Sidebar: Gallery + Organizers */}
          {(hasGallery ||
            (event.organizers && event.organizers.length > 0)) && (
            <aside className="w-full shrink-0 space-y-8 lg:w-[30%] xl:w-72">
              {hasGallery && <PostGalleryPanel images={galleryData} />}

              {event.organizers && event.organizers.length > 0 && (
                <div className="rounded-xl border bg-muted/30 p-5">
                  <div className="mb-3 flex items-center gap-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5" />
                    {t("organizersTitle")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.organizers.map((org: any) => (
                      <Link
                        className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 font-medium text-xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        href={
                          `/members/${org.member.slug || org.member.id}` as "/"
                        }
                        key={org.id}
                      >
                        {org.member.avatar ? (
                          // biome-ignore lint/performance/noImgElement: avatar
                          // biome-ignore lint/correctness/useImageSize: CSS
                          <img
                            alt={getFullName(
                              org.member.firstName,
                              org.member.lastName,
                              locale,
                            )}
                            className="h-5 w-5 rounded-full object-cover"
                            src={org.member.avatar}
                          />
                        ) : (
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span>
                          {getFullName(
                            org.member.firstName,
                            org.member.lastName,
                            locale,
                          )}
                          {org.role ? ` (${org.role})` : ""}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Related events */}
        {recentEvents.length > 0 && (
          <div className="mt-20 border-t pt-10">
            <h2 className="mb-8 font-black text-2xl text-foreground">
              {t("otherEventsTitle")}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentEvents.map((e: any) => (
                <Link
                  className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                  href={`/events/${e.slug}` as "/"}
                  key={e.id}
                >
                  {e.thumbnail ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {/* biome-ignore lint/performance/noImgElement: thumbnail */}
                      {/* biome-ignore lint/correctness/useImageSize: CSS */}
                      <img
                        alt={e.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={e.thumbnail}
                      />
                    </div>
                  ) : (
                    <div className="relative flex aspect-video w-full items-center justify-center bg-muted/40 text-muted-foreground">
                      <span>{t("noThumbnail")}</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2 flex items-center justify-between text-muted-foreground text-xs">
                      <span className="rounded bg-muted px-2 py-0.5 font-medium">
                        {t("badgeLabel")}
                      </span>
                      <span>{fmtDateShort(e.startAt, locale)}</span>
                    </div>
                    <h3 className="line-clamp-2 font-bold text-foreground leading-snug transition-colors group-hover:text-primary">
                      {e.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
