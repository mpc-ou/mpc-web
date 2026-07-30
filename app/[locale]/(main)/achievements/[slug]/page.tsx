import { Award, Calendar, ChevronLeft, ExternalLink, Star, Trophy, UserCircle, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAchievementBySlug, getRecentAchievements } from "@/app/_actions/main";
import { MarkdownContent } from "@/components/markdown-content";
import { PostGalleryPanel } from "@/components/post-gallery-panel.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { getFullName } from "@/lib/utils";
import { getDiceBearUrl } from "@/utils/dicebear-avatar";
import { formatLocalDate } from "@/utils/handle-datetime";
import { generatePageSeo } from "@/utils/seo";
import { HonoredMembers } from "./_components/honored-members.client";

type Props = { params: Promise<{ slug: string; locale: string }> };

type MemberDetail = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  avatar: string | null;
  slug: string | null;
};

type AchievementMember = {
  id: string;
  postId: string;
  memberId: string;
  role: string | null;
  prize: string | null;
  imageUrl: string | null;
  member: MemberDetail;
};

type GalleryImage = {
  id: string;
  url: string;
  title: string | null;
  caption: string | null;
  type: string;
  order: number;
};

type AchievementTag = {
  postId: string;
  tagId: string;
  tag: { id: string; name: string; slug: string };
};

type AchievementDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  images: string[];
  date: string | null;
  type: string | null;
  isHighlight: boolean;
  relatedUrl: string | null;
  achievementMembers: AchievementMember[];
  members: AchievementMember[];
  creator: MemberDetail | null;
  gallery: GalleryImage[];
  tags: AchievementTag[];
};

type RecentAchievement = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  date: string | null;
  type: string | null;
  isHighlight: boolean;
};

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
  const { data } = await getAchievementBySlug(slug, locale);
  const achievement = (data?.payload as { achievement: AchievementDetail | null } | undefined)?.achievement;
  if (!achievement) {
    const tSeo = await getTranslations({ locale, namespace: "seo.notFound" });
    return { title: tSeo("achievement") };
  }
  return generatePageSeo({
    page: "achievements",
    title: achievement.title,
    description: achievement.summary?.slice(0, 160) || undefined,
    locale: locale || "vi",
    pathname: `/achievements/${slug}`,
    image: achievement.thumbnail || undefined,
    type: "article"
  });
}

export default async function AchievementDetailPage({ params }: Props): Promise<React.ReactNode> {
  const { slug, locale } = await params;

  const [{ data }, { data: recentData }, t] = await Promise.all([
    getAchievementBySlug(slug, locale),
    getRecentAchievements(4, locale),
    getTranslations({ locale, namespace: "achievements" })
  ]);

  const achievement = (data?.payload as { achievement: AchievementDetail | null } | undefined)?.achievement;
  if (!achievement) {
    notFound();
  }

  const dateLabel = fmtDate(achievement.date, locale);

  const recentAchievements = (
    (recentData?.payload as { achievements: RecentAchievement[] } | undefined)?.achievements ?? []
  )
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  // Combine gallery images: thumbnail, content images, member profile images, and additional images
  const thumbnail = achievement.thumbnail ? [achievement.thumbnail] : [];
  const contentImages: string[] = [];
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  imgRegex.lastIndex = 0;
  let match = imgRegex.exec(achievement.content || "");
  while (match !== null) {
    if (match[1]) {
      contentImages.push(match[1]);
    }
    match = imgRegex.exec(achievement.content || "");
  }
  const memberImages = (achievement.achievementMembers || [])
    .map((am) => am.imageUrl)
    .filter((url): url is string => Boolean(url));

  const hasStoredGallery = achievement.gallery && achievement.gallery.length > 0;
  let additionalImages: string[] = [];
  if (hasStoredGallery) {
    additionalImages = achievement.gallery.filter((g) => g.type === "ADDITIONAL").map((g) => g.url);
  } else if (Array.isArray(achievement.images)) {
    additionalImages = achievement.images;
  }

  const allImages = Array.from(new Set([...thumbnail, ...contentImages, ...memberImages, ...additionalImages])).filter(
    Boolean
  );

  const galleryData = hasStoredGallery ? achievement.gallery : allImages;
  const hasGallery = galleryData.length > 0;

  const typeMap: Record<string, string> = {
    INDIVIDUAL: t("individual"),
    TEAM: t("team"),
    CLUB: t("club")
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* ── HERO ── */}
      {achievement.thumbnail ? (
        <div className='relative h-[30vh] min-h-56 w-full overflow-hidden'>
          <Image
            alt={achievement.title}
            className='object-cover'
            fill
            priority
            sizes='100vw'
            src={achievement.thumbnail}
          />
          <div className='absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent' />
        </div>
      ) : (
        <div className='h-20 sm:h-28' />
      )}

      <div className='container mx-auto max-w-7xl px-4 pb-24'>
        {/* Back */}
        <div className='py-5'>
          <Button asChild className='-ml-3 text-muted-foreground' size='sm' variant='ghost'>
            <Link href='/achievements'>
              <ChevronLeft className='mr-1 h-4 w-4' />
              {t("backToList")}
            </Link>
          </Button>
        </div>

        <ScrollReveal>
          {/* Badges */}
          <div className='mb-6 flex flex-wrap items-center gap-2'>
            <Badge className='px-3 py-1' variant='outline'>
              {t("badgeLabel")}
            </Badge>
            {achievement.type && (
              <Badge className='border-none bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20' variant='outline'>
                {achievement.type === "INDIVIDUAL" ? (
                  <Trophy className='mr-1 inline-block h-3 w-3' />
                ) : (
                  <Users className='mr-1 inline-block h-3 w-3' />
                )}
                {typeMap[achievement.type] ?? achievement.type}
              </Badge>
            )}
            {achievement.isHighlight && (
              <Badge className='border-0 bg-amber-500/15 px-3 py-1 text-amber-500'>
                <Star className='mr-1 h-3 w-3 fill-amber-500' />
                {t("highlight")}
              </Badge>
            )}
            {achievement.tags?.map((tTag) => (
              <Badge
                className='border-none bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20'
                key={tTag.tag.id}
                variant='outline'
              >
                #{tTag.tag.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className='mb-6 font-black text-3xl text-foreground leading-tight tracking-tight sm:text-4xl xl:text-5xl'>
            {achievement.title}
          </h1>

          {/* Byline: author + date */}
          <div className='mb-8 flex flex-wrap items-center justify-between gap-4 border-border/60 border-y py-4 text-muted-foreground text-sm'>
            <div className='flex items-center gap-3'>
              {achievement.creator?.avatar ? (
                <Image
                  alt={getFullName(
                    achievement.creator.firstName,
                    achievement.creator.middleName,
                    achievement.creator.lastName,
                    locale
                  )}
                  className='shrink-0 rounded-full object-cover ring-1 ring-border'
                  height={40}
                  src={achievement.creator.avatar}
                  width={40}
                />
              ) : (
                <UserCircle className='h-10 w-10 text-muted-foreground' />
              )}
              <div className='min-w-0'>
                <span className='block font-semibold text-foreground text-sm leading-none'>
                  {getFullName(
                    achievement.creator?.firstName,
                    achievement.creator?.middleName,
                    achievement.creator?.lastName,
                    locale
                  )}
                </span>
                {achievement.creator?.slug && (
                  <Link
                    className='mt-1 block text-muted-foreground text-xs hover:text-primary hover:underline'
                    href={`/members/${achievement.creator.slug}` as "/"}
                  >
                    @{achievement.creator.slug}
                  </Link>
                )}
              </div>
            </div>
            {dateLabel && (
              <span className='flex items-center gap-1.5'>
                <Calendar className='h-4 w-4 shrink-0 text-primary/60' />
                {dateLabel}
              </span>
            )}
          </div>

          {/* Summary / lead */}
          {achievement.summary && (
            <p className='mb-10 border-primary border-l-4 pl-4 font-medium text-foreground/80 text-xl leading-relaxed'>
              {achievement.summary}
            </p>
          )}
        </ScrollReveal>

        <Separator className='mb-10' />

        {/* ── BODY + SIDEBAR ── */}
        <div
          className={`flex flex-col gap-10 ${hasGallery || (achievement.members && achievement.members.length > 0) ? "lg:flex-row lg:gap-12" : ""}`}
        >
          <div
            className={`min-w-0 ${hasGallery || (achievement.members && achievement.members.length > 0) ? "flex-1" : "w-full"}`}
          >
            {/* Achievement info card */}
            <ScrollReveal className='mb-8'>
              <div className='space-y-4 rounded-xl border bg-muted/30 p-5'>
                <h2 className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>{t("infoTitle")}</h2>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {achievement.date && (
                    <div className='flex items-start gap-2.5'>
                      <Trophy className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
                      <div>
                        <p className='font-medium text-muted-foreground text-xs'>{t("recognizedDate")}</p>
                        <p className='font-semibold text-foreground text-sm'>
                          {fmtDateShort(achievement.date, locale)}
                        </p>
                      </div>
                    </div>
                  )}
                  {achievement.type && (
                    <div className='flex items-start gap-2.5'>
                      <Award className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
                      <div>
                        <p className='font-medium text-muted-foreground text-xs'>{t("typeLabel")}</p>
                        <p className='font-semibold text-foreground text-sm'>
                          {typeMap[achievement.type] ?? achievement.type}
                        </p>
                      </div>
                    </div>
                  )}
                  {achievement.relatedUrl && (
                    <div className='col-span-full flex items-start gap-2.5'>
                      <ExternalLink className='mt-0.5 h-4 w-4 shrink-0 text-primary/70' />
                      <div className='min-w-0'>
                        <p className='font-medium text-muted-foreground text-xs'>{t("evidenceLink")}</p>
                        <a
                          className='block truncate font-medium text-primary text-sm hover:underline'
                          href={achievement.relatedUrl}
                          rel='noopener noreferrer'
                          target='_blank'
                        >
                          {achievement.relatedUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Markdown content */}
            {achievement.content && (
              <ScrollReveal delay={200} variant='fade-up'>
                <MarkdownContent content={achievement.content} />
              </ScrollReveal>
            )}
          </div>

          {/* Sidebar: Gallery + Honored Members */}
          {(hasGallery || (achievement.members && achievement.members.length > 0)) && (
            <aside className='sticky top-6 w-full shrink-0 space-y-8 lg:w-[30%] xl:w-72'>
              {hasGallery && (
                <PostGalleryPanel images={galleryData} title={`${t("galleryTitle")} (${galleryData.length})`} />
              )}

              {achievement.members && achievement.members.length > 0 && (
                <HonoredMembers locale={locale} members={achievement.members} />
              )}
            </aside>
          )}
        </div>

        {/* Related achievements */}
        {recentAchievements.length > 0 && (
          <div className='mt-20 border-t pt-10'>
            <h2 className='mb-8 font-black text-2xl text-foreground'>{t("otherAchievements")}</h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {recentAchievements.map((a) => (
                <Link
                  className='group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md'
                  href={`/achievements/${a.slug}` as "/"}
                  key={a.id}
                >
                  {a.thumbnail ? (
                    <div className='relative aspect-video w-full overflow-hidden bg-muted'>
                      <Image
                        alt={a.title}
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                        fill
                        sizes='(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                        src={a.thumbnail}
                      />
                    </div>
                  ) : (
                    <div className='relative flex aspect-video w-full items-center justify-center bg-muted/40 text-muted-foreground'>
                      <Trophy className='h-10 w-10 opacity-20' />
                    </div>
                  )}
                  <div className='flex flex-1 flex-col p-5'>
                    <div className='mb-2 flex items-center justify-between text-muted-foreground text-xs'>
                      <span className='rounded bg-muted px-2 py-0.5 font-medium'>{t("badgeLabel")}</span>
                      {a.date && <span>{fmtDateShort(a.date, locale)}</span>}
                    </div>
                    <h3 className='line-clamp-2 font-bold text-foreground leading-snug transition-colors group-hover:text-primary'>
                      {a.title}
                    </h3>
                    {a.summary && (
                      <p className='mt-2 line-clamp-2 text-muted-foreground text-xs leading-relaxed'>{a.summary}</p>
                    )}
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
