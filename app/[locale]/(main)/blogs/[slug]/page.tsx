import {
  Award,
  Calendar,
  ChevronLeft,
  Clock,
  Edit3,
  ExternalLink,
  MapPin,
  Star,
  Trophy,
  UserCircle,
  Users
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getBlogBySlug, getBlogBySlugForUser, getRelatedPosts } from "@/app/_actions/main";
import { ImageLightbox } from "@/components/image-lightbox.client";
import { MarkdownContent } from "@/components/markdown-content";
import { PostGalleryPanel } from "@/components/post-gallery-panel.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/configs/i18n/routing";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";
import { generatePageSeo } from "@/utils/seo";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

type AchievementMember = {
  role: string | null;
  member: {
    id: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    avatar: string | null;
    slug: string | null;
  };
};

type PostPayload = {
  blog: {
    id: string;
    type: string;
    title: string;
    slug: string;
    status?: string;
    description: string | null;
    content: string | null;
    thumbnail: string | null;
    images: string[];
    gallery?: Array<{
      id: string;
      url: string;
      title: string | null;
      caption: string | null;
      type: string;
      order: number;
    }>;
    publishedAt: string;
    startAt: string | null;
    endAt: string | null;
    location: string | null;
    eventStatus: string | null;
    eventType: string | null;
    achievementDate: string | null;
    achievementType: string | null;
    isHighlight: boolean;
    relatedUrl: string | null;
    achievementMembers: AchievementMember[];
    creator: {
      firstName: string;
      middleName?: string | null;
      lastName: string;
      avatar: string | null;
      slug: string | null;
    } | null;
    tags: Array<{ tag: { id: string; nameVi: string; nameEn: string } }>;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const { data } = await getBlogBySlug(slug, locale);
  const payload = data?.payload as PostPayload | undefined;
  const blog = payload?.blog;

  if (!blog) {
    const tSeo = await getTranslations({ locale, namespace: "seo.notFound" });
    return { title: tSeo("blog") };
  }

  return generatePageSeo({
    page: "blogDetail",
    title: blog.title,
    description: blog.description?.slice(0, 160) || undefined,
    locale: locale || "vi",
    pathname: `/blogs/${slug}`,
    image: blog.thumbnail || undefined,
    type: "article"
  });
}

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

export default async function BlogDetailPage({ params }: Props): Promise<React.ReactNode> {
  const { slug, locale } = await params;

  let [{ data }, t] = await Promise.all([getBlogBySlug(slug, locale), getTranslations({ locale, namespace: "blogs" })]);
  let payload = data?.payload as PostPayload | undefined;
  let blog = payload?.blog;

  if (!blog) {
    const userResult = await getBlogBySlugForUser(slug, locale);
    const userPayload = userResult.data?.payload as PostPayload | undefined;
    blog = userPayload?.blog ?? undefined;
    if (!blog) {
      notFound();
    }
    t = await getTranslations({ locale, namespace: "blogs" });
  }

  if (blog.type === "EVENT") {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/events/${slug}`);
  }
  if (blog.type === "ACHIEVEMENT") {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/achievements/${slug}`);
  }

  const { data: relatedData } = await getRelatedPosts(
    blog.id,
    blog.tags.map((tTag) => tTag.tag.id),
    blog.type,
    3,
    locale
  );
  const relatedPosts =
    (relatedData?.payload as Array<{
      id: string;
      title: string;
      slug: string;
      description: string | null;
      thumbnail: string | null;
      publishedAt: string;
      type: string;
    }>) || [];

  const dateLabel = fmtDate(blog.publishedAt, locale === "vi" ? "vi-VN" : "en-US");
  const isEvent = blog.type === "EVENT";
  const isAchievement = blog.type === "ACHIEVEMENT";

  const thumbnail = blog.thumbnail ? [blog.thumbnail] : [];
  const contentImages: string[] = [];
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  imgRegex.lastIndex = 0;
  let match = imgRegex.exec(blog.content || "");
  while (match !== null) {
    if (match[1]) {
      contentImages.push(match[1]);
    }
    match = imgRegex.exec(blog.content || "");
  }
  const storedGallery = blog.gallery ?? [];
  const hasStoredGallery = storedGallery.length > 0;
  let additionalImages: string[] = [];
  if (hasStoredGallery) {
    additionalImages = storedGallery.filter((g) => g.type === "ADDITIONAL").map((g) => g.url);
  } else if (Array.isArray(blog.images)) {
    additionalImages = blog.images;
  }

  const galleryImages = Array.from(new Set([...thumbnail, ...contentImages, ...additionalImages])).filter(Boolean);

  const galleryData = hasStoredGallery ? storedGallery : galleryImages;
  const hasGallery = galleryData.length > 0;

  let canEdit = false;
  try {
    const supabase = await createClientSsr();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const member = await prisma.member.findUnique({
        where: { id: user.id },
        select: { webRole: true }
      });
      if (member && member.webRole === "ADMIN") {
        canEdit = true;
      }
    }
  } catch {
    // Not logged in
  }

  let backHref = "/blogs";
  let backLabel = t("backToBlogs");
  if (isEvent) {
    backHref = "/events";
    backLabel = t("backToEvents");
  } else if (isAchievement) {
    backHref = "/achievements";
    backLabel = t("backToAchievements");
  }

  const eventTypeKey = blog.eventType?.toLowerCase();
  const achievementTypeKey = blog.achievementType?.toLowerCase();
  const eventStatusKey = blog.eventStatus?.toLowerCase();

  let typeBadge = t("badgeBlog");
  if (isEvent) {
    typeBadge = eventTypeKey ? t(`eventType.${eventTypeKey}`) : t("badgeEvent");
  } else if (isAchievement) {
    typeBadge = achievementTypeKey ? t(`achievementType.${achievementTypeKey}`) : t("badgeAchievement");
  }

  const EVENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
    UPCOMING: {
      label: t("eventStatus.upcoming"),
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    ONGOING: {
      label: t("eventStatus.ongoing"),
      color: "bg-green-500/10 text-green-500 border-green-500/20"
    },
    COMPLETED: {
      label: t("eventStatus.completed"),
      color: "bg-muted text-muted-foreground border-border"
    },
    CANCELLED: {
      label: t("eventStatus.cancelled"),
      color: "bg-red-500/10 text-red-500 border-red-500/20"
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      {blog.thumbnail ? (
        <div className='relative h-[40vh] min-h-72 w-full overflow-hidden'>
          <Image alt={blog.title} className='object-cover' fill priority sizes='100vw' src={blog.thumbnail} />
          <div className='absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent' />
        </div>
      ) : (
        <div className='h-20 sm:h-28' />
      )}

      <div className='container mx-auto max-w-7xl px-4 pb-24'>
        <div className='py-5'>
          <Button asChild className='-ml-3 text-muted-foreground' size='sm' variant='ghost'>
            <Link href={backHref as "/"}>
              <ChevronLeft className='mr-1 h-4 w-4' />
              {backLabel}
            </Link>
          </Button>
        </div>

        <ScrollReveal>
          <div className='mb-6 flex flex-wrap items-center gap-2'>
            <Badge className='px-3 py-1' variant='outline'>
              {typeBadge}
            </Badge>
            {isEvent && blog.eventStatus && (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 font-medium text-xs ${EVENT_STATUS_MAP[blog.eventStatus]?.color ?? ""}`}
              >
                {EVENT_STATUS_MAP[blog.eventStatus]?.label ?? blog.eventStatus}
              </span>
            )}
            {isAchievement && blog.isHighlight && (
              <Badge className='border-0 bg-amber-500/15 px-3 py-1 text-amber-500'>
                <Star className='mr-1 h-3 w-3 fill-amber-500' />
                {t("highlighted")}
              </Badge>
            )}
            {blog.tags?.map((tTag) => {
              const name = locale === "en" ? tTag.tag.nameEn : tTag.tag.nameVi;
              return (
                <Badge
                  className='border-none bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20'
                  key={tTag.tag.id}
                  variant='outline'
                >
                  #{name}
                </Badge>
              );
            })}
          </div>

          <h1 className='mb-6 font-black text-3xl text-foreground leading-tight tracking-tight sm:text-4xl xl:text-5xl'>
            {blog.title}
          </h1>

          <div className='mb-8 flex flex-wrap items-center justify-between gap-4 border-border/60 border-y py-4 text-muted-foreground text-sm'>
            <div className='flex items-center gap-3'>
              {blog.creator?.avatar ? (
                <Image
                  alt={getFullName(blog.creator.firstName, blog.creator.middleName, blog.creator.lastName, locale)}
                  className='shrink-0 rounded-full object-cover ring-1 ring-border'
                  height={40}
                  src={blog.creator.avatar}
                  width={40}
                />
              ) : (
                <UserCircle className='h-10 w-10 text-muted-foreground' />
              )}
              <div className='min-w-0'>
                <span className='block font-semibold text-foreground text-sm leading-none'>
                  {getFullName(blog.creator?.firstName, blog.creator?.middleName, blog.creator?.lastName, locale)}
                </span>
                <Link
                  className='mt-1 block text-muted-foreground text-xs hover:text-primary hover:underline'
                  href={`/members/${blog.creator?.slug || blog.creator?.firstName}` as "/"}
                >
                  @{blog.creator?.slug || blog.creator?.firstName}
                </Link>
              </div>
            </div>

            {dateLabel && (
              <span className='flex items-center gap-1.5'>
                <Calendar className='h-4 w-4 shrink-0 text-primary/60' />
                {dateLabel}
              </span>
            )}
            {canEdit && (
              <Link href={`/admin/posts/${blog.id}/edit` as "/"}>
                <Button className='h-8' size='sm' variant='outline'>
                  <Edit3 className='mr-1.5 h-3.5 w-3.5' />
                  Sửa bài
                </Button>
              </Link>
            )}
          </div>

          {blog.description && (
            <p className='mb-10 border-primary border-l-4 pl-4 font-medium text-foreground/80 text-xl leading-relaxed'>
              {blog.description}
            </p>
          )}
        </ScrollReveal>

        <Separator className='mb-10' />

        <div className={`flex flex-col gap-10 ${hasGallery ? "lg:flex-row lg:gap-12" : ""}`}>
          <div className={`min-w-0 ${hasGallery ? "flex-1 lg:w-[70%]" : "w-full"}`}>
            {isEvent && (
              <ScrollReveal className='mb-8'>
                <div className='space-y-3 rounded-xl border bg-muted/30 p-5'>
                  <h2 className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>{t("eventInfo")}</h2>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    {blog.location && (
                      <div className='flex items-start gap-2.5'>
                        <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-primary/70' />
                        <div>
                          <p className='font-medium text-muted-foreground text-xs'>Địa điểm</p>
                          <p className='font-semibold text-foreground text-sm'>{blog.location}</p>
                        </div>
                      </div>
                    )}
                    {blog.startAt && (
                      <div className='flex items-start gap-2.5'>
                        <Clock className='mt-0.5 h-4 w-4 shrink-0 text-primary/70' />
                        <div>
                          <p className='font-medium text-muted-foreground text-xs'>Thời gian</p>
                          <p className='font-semibold text-foreground text-sm'>
                            {fmtDateShort(blog.startAt, locale)}
                            {blog.endAt ? ` – ${fmtDateShort(blog.endAt, locale)}` : ""}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {isAchievement && (
              <ScrollReveal className='mb-8'>
                <div className='space-y-4 rounded-xl border bg-muted/30 p-5'>
                  <h2 className='font-bold text-muted-foreground text-sm uppercase tracking-wider'>
                    {t("achievementInfo")}
                  </h2>
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    {blog.achievementDate && (
                      <div className='flex items-start gap-2.5'>
                        <Trophy className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
                        <div>
                          <p className='font-medium text-muted-foreground text-xs'>{t("dateRecorded")}</p>
                          <p className='font-semibold text-foreground text-sm'>
                            {fmtDateShort(blog.achievementDate, locale)}
                          </p>
                        </div>
                      </div>
                    )}
                    {blog.achievementType && (
                      <div className='flex items-start gap-2.5'>
                        <Award className='mt-0.5 h-4 w-4 shrink-0 text-amber-500' />
                        <div>
                          <p className='font-medium text-muted-foreground text-xs'>{t("typeLabel")}</p>
                          <p className='font-semibold text-foreground text-sm'>
                            {achievementTypeKey ? t(`achievementType.${achievementTypeKey}`) : blog.achievementType}
                          </p>
                        </div>
                      </div>
                    )}
                    {blog.relatedUrl && (
                      <div className='col-span-full flex items-start gap-2.5'>
                        <ExternalLink className='mt-0.5 h-4 w-4 shrink-0 text-primary/70' />
                        <div className='min-w-0'>
                          <p className='font-medium text-muted-foreground text-xs'>{t("relatedLink")}</p>
                          <a
                            className='block truncate font-medium text-primary text-sm hover:underline'
                            href={blog.relatedUrl}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {blog.relatedUrl}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {blog.achievementMembers.length > 0 && (
                    <div className='space-y-2 border-t pt-4'>
                      <div className='flex items-center gap-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                        <Users className='h-3.5 w-3.5' />
                        {t("honoredMembers")}
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {blog.achievementMembers.map((am) => (
                          <Link
                            className='flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 font-medium text-xs transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                            href={`/members/${am.member.slug || am.member.id}` as "/"}
                            key={am.member.id}
                          >
                            {am.member.avatar ? (
                              <Image
                                alt={getFullName(am.member.firstName, am.member.middleName, am.member.lastName, locale)}
                                className='rounded-full object-cover'
                                height={20}
                                src={am.member.avatar}
                                width={20}
                              />
                            ) : (
                              <UserCircle className='h-5 w-5 text-muted-foreground' />
                            )}
                            <span>
                              {getFullName(am.member.firstName, am.member.middleName, am.member.lastName, locale)}
                              {am.role ? ` (${am.role})` : ""}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {blog.content && (
              <ScrollReveal delay={200} variant='fade-up'>
                <MarkdownContent content={blog.content} />
              </ScrollReveal>
            )}
          </div>

          {hasGallery && (
            <aside className='w-full shrink-0 lg:w-[30%] xl:w-72'>
              <PostGalleryPanel images={galleryData} />
            </aside>
          )}
        </div>

        {relatedPosts.length > 0 && (
          <div className='mt-20 border-t pt-10'>
            <h2 className='mb-8 font-black text-2xl text-foreground'>{t("relatedBlogsTitle")}</h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {relatedPosts.map((post) => {
                let relatedHref = `/blogs/${post.slug}`;
                let relatedBadge = t("badgeBlog");
                if (post.type === "EVENT") {
                  relatedHref = `/events/${post.slug}`;
                  relatedBadge = t("badgeEvent");
                } else if (post.type === "ACHIEVEMENT") {
                  relatedHref = `/achievements/${post.slug}`;
                  relatedBadge = t("badgeAchievement");
                }
                return (
                  <Link
                    className='group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md'
                    href={relatedHref}
                    key={post.id}
                  >
                    {post.thumbnail ? (
                      <div className='relative aspect-video w-full overflow-hidden bg-muted'>
                        <Image
                          alt={post.title}
                          className='object-cover transition-transform duration-500 group-hover:scale-105'
                          fill
                          sizes='(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                          src={post.thumbnail}
                        />
                      </div>
                    ) : (
                      <div className='relative flex aspect-video w-full items-center justify-center bg-muted/40 text-muted-foreground'>
                        <span>{t("noThumbnail")}</span>
                      </div>
                    )}
                    <div className='flex flex-1 flex-col p-5'>
                      <div className='mb-2 flex items-center justify-between text-muted-foreground text-xs'>
                        <span className='rounded bg-muted px-2 py-0.5 font-medium'>{relatedBadge}</span>
                        <span>{fmtDateShort(post.publishedAt, locale)}</span>
                      </div>
                      <h3 className='line-clamp-2 font-bold text-foreground leading-snug transition-colors group-hover:text-primary'>
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className='mt-2 line-clamp-2 text-muted-foreground text-xs leading-relaxed'>
                          {post.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
