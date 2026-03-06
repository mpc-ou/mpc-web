import {
  Calendar,
  ChevronLeft,
  Trophy,
  User2,
  UserCircle,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryCarousel } from "@/app/[locale]/(main)/gallery-carousel.client";
import { getAchievementBySlug } from "@/app/[locale]/actions/pages";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { generatePageSeo } from "@/utils/seo";
import { getFullName } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const { data } = await getAchievementBySlug(slug);
  // biome-ignore lint/suspicious/noExplicitAny: API shape
  const achievement = (data?.payload as any)?.achievement;

  if (!achievement) {
    return { title: "Không tìm thấy thành tựu" };
  }

  return generatePageSeo({
    page: "achievements",
    title: achievement.title,
    description: achievement.summary?.slice(0, 160) || undefined,
    locale: locale || "vi",
    pathname: `/achievements/${slug}`,
    image: achievement.thumbnail || undefined,
    type: "article",
  });
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<React.ReactNode> {
  const { slug, locale } = await params;

  const { data } = await getAchievementBySlug(slug);
  // biome-ignore lint/suspicious/noExplicitAny: API shape
  const achievement = (data?.payload as any)?.achievement;

  if (!achievement) {
    notFound();
  }

  const dateLabel = achievement.date
    ? new Date(achievement.date).toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO IMAGE ─────────────────────────────────────────────── */}
      {achievement.thumbnail ? (
        <div className="relative h-[55vh] min-h-90 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={achievement.title}
            className="h-full w-full object-cover"
            src={achievement.thumbnail}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="h-24 sm:h-32" />
      )}

      {/* ── ARTICLE ────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-6xl px-4 pb-24">
        {/* Back link */}
        <div className="py-5">
          <Button
            asChild
            className="-ml-3 text-muted-foreground"
            size="sm"
            variant="ghost"
          >
            <Link href="/achievements">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Trở lại bảng vàng
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-16">
          {/* Left / Main Content */}
          <div className="lg:col-span-3">
            <ScrollReveal>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {achievement.isHighlight && (
                  <Badge className="bg-yellow-500 px-3 py-1 font-semibold text-black text-sm hover:bg-yellow-400">
                    ⭐ Nổi bật
                  </Badge>
                )}
                <Badge className="px-3 py-1" variant="outline">
                  Thành tựu
                </Badge>
              </div>

              <h1 className="mb-4 font-black text-3xl tracking-tight sm:text-5xl">
                {achievement.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-sm">
                {dateLabel && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
                    {dateLabel}
                  </span>
                )}
                <span className="flex items-center gap-1.5 border-border border-l pl-2">
                  {achievement.type === "INDIVIDUAL" ? (
                    <User2 className="h-4 w-4 shrink-0 text-primary/60" />
                  ) : (
                    <Users className="h-4 w-4 shrink-0 text-primary/60" />
                  )}
                  {achievement.type === "INDIVIDUAL"
                    ? "Cá nhân"
                    : achievement.type === "TEAM"
                      ? "Nhóm"
                      : "Tập thể"}
                </span>
              </div>

              {achievement.summary && (
                <p className="mb-10 border-primary border-l-4 pl-4 font-medium text-foreground/80 text-xl">
                  {achievement.summary}
                </p>
              )}
            </ScrollReveal>

            <Separator className="mb-10" />

            {/* ── GALLERY ── */}
            {achievement.images && achievement.images.length > 0 && (
              <div className="mb-14">
                <GalleryCarousel
                  images={achievement.images.map(
                    (url: string, index: number) => ({
                      id: String(index),
                      url,
                      caption: null,
                      order: index,
                    }),
                  )}
                />
              </div>
            )}

            {/* Content Body */}
            {achievement.content && (
              <ScrollReveal delay={200} variant="fade-up">
                <MarkdownContent content={achievement.content} />
              </ScrollReveal>
            )}

            {/* Action / Related link */}
            {achievement.relatedUrl && (
              <div className="mb-14">
                <Button asChild>
                  <a
                    href={achievement.relatedUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Trophy className="mr-2 h-4 w-4" /> Trích xuất Link minh
                    chứng
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar: Members */}
          <div className="border-border lg:col-span-1 lg:border-l lg:pl-8">
            {achievement.members && achievement.members.length > 0 && (
              <ScrollReveal variant="fade-up">
                <div className="sticky top-24">
                  <h2 className="mb-5 flex items-center gap-2 border-border border-b pb-2 font-bold text-xl">
                    <Users className="h-5 w-5 text-primary" /> Thành viên
                  </h2>
                  <div className="flex flex-col gap-4">
                    {achievement.members.map((m: any) => (
                      <div
                        className="flex items-center gap-3"
                        key={m.member.id}
                      >
                        {m.member.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={getFullName(
                              m.member.firstName,
                              m.member.lastName,
                              locale,
                            )}
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                            src={m.member.avatar}
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-lg uppercase">
                            {m.member.firstName[0]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            className="block truncate font-medium text-sm hover:text-primary hover:underline"
                            href={`/members/${m.member.slug || m.member.memberId || m.member.id}`}
                          >
                            {getFullName(
                              m.member.firstName,
                              m.member.lastName,
                              locale,
                            )}
                          </Link>
                          {m.role && (
                            <p
                              className="mt-0.5 line-clamp-2 font-mono text-muted-foreground text-xs uppercase"
                              title={m.role}
                            >
                              {m.role}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
