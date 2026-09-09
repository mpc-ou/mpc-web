"use client";

import { AlertTriangle, BadgeCheck, Calendar, DoorOpen, Globe, Hash, Mail, Phone, Trophy, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { BadgeIcon, getActiveBadges } from "@/components/custom/badge-icon";
import { CoverParallax } from "@/components/custom/cover-parallax";
import { SpotifyPlayer } from "@/components/custom/spotify-player";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BadgeData } from "@/configs/badges";
import { SOCIAL_COLLECTION } from "@/constants/common";
import { buildSocialHref, getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";

const getSocialMeta = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("facebook") || p === "fb") {
    return SOCIAL_COLLECTION.FACEBOOK;
  }
  if (p.includes("twitter") || p === "x") {
    return SOCIAL_COLLECTION.TWITTER;
  }
  if (p.includes("linkedin")) {
    return SOCIAL_COLLECTION.LINKEDIN;
  }
  if (p.includes("github")) {
    return SOCIAL_COLLECTION.GITHUB;
  }
  if (p.includes("instagram") || p === "ig") {
    return SOCIAL_COLLECTION.INSTAGRAM;
  }
  if (p.includes("tiktok")) {
    return SOCIAL_COLLECTION.TIKTOK;
  }
  if (p.includes("youtube") || p === "yt") {
    return SOCIAL_COLLECTION.YOUTUBE;
  }
  if (p.includes("discord")) {
    return SOCIAL_COLLECTION.DISCORD;
  }
  if (p.includes("email") || p.includes("mail")) {
    return SOCIAL_COLLECTION.EMAIL;
  }
  return SOCIAL_COLLECTION.WEBSITE;
};

export type Member = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  phone: string | null;
  email: string;
  studentId: string | null;
  dob: string | null;
  showDob: boolean;
  showPhone: boolean;
  showStudentId: boolean;
  socials: { id?: string; platform: string; url: string }[] | null;
  webRole: string;
  joinedClubAt: string | null;
  spotifyUri: string | null;
  clubRoles: {
    id: string;
    position: string;
    term: number | null;
    startAt: string;
    endAt: string | null;
    note: string | null;
    department: { nameVi: string } | null;
  }[];
  achievements: {
    role: string | null;
    achievement: {
      id: string;
      title: string;
      date: string;
      type: string;
      isHighlight: boolean;
      slug: string;
      thumbnail: string | null;
    };
  }[];
  projects: {
    role: string | null;
    project: {
      id: string;
      slug: string;
      title: string;
      titleEn?: string | null;
      description: string | null;
      descriptionEn?: string | null;
      content: string | null;
      thumbnail: string | null;
      githubUrl: string | null;
      websiteUrl: string | null;
      videoUrl: string | null;
      technologies: string[];
      isActive: boolean;
      startDate: string | null;
      endDate: string | null;
      members?: {
        member: {
          id: string;
          firstName: string;
          lastName: string;
          middleName: string | null;
          avatar: string | null;
          slug: string;
        };
      }[];
    };
  }[];
  authoredPosts: {
    id: string;
    titleVi: string;
    titleEn?: string | null;
    thumbnail?: string | null;
    summaryVi?: string | null;
    summaryEn?: string | null;
    publishedAt: string | null;
    slug: string;
    type: string;
  }[];
};

type MemberHeaderProps = {
  member: Member;
  fullName: string;
  initials: string;
  activeRole: Member["clubRoles"][number] | undefined;
  isGuest: boolean;
  hasLeftClub: boolean;
  activeBadges: ReturnType<typeof getActiveBadges>;
  tm: (key: string) => string;
  tPos: (key: string) => string;
};

function MemberProfileHeader({
  member,
  fullName,
  initials,
  activeRole,
  isGuest,
  hasLeftClub,
  activeBadges,
  tm,
  tPos
}: MemberHeaderProps) {
  return (
    <div className='mx-auto max-w-6xl px-4'>
      <div className='relative -mt-16 flex flex-col gap-4 md:-mt-20 md:flex-row md:items-end'>
        <div className='shrink-0'>
          <Avatar className='h-32 w-32 border-4 border-background shadow-xl md:h-40 md:w-40'>
            <AvatarImage src={member.avatar ?? undefined} />
            <AvatarFallback className='bg-primary/10 font-bold text-4xl text-primary'>{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div className='flex flex-1 flex-col gap-2 pb-4'>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='font-bold text-3xl text-foreground'>
                {fullName}
                {isGuest && (
                  <span title={tm("guestNotice")}>
                    <AlertTriangle className='ml-1.5 inline-block h-5 w-5 text-amber-500' />
                  </span>
                )}
                {!(isGuest || hasLeftClub) && (
                  <span title={tm("activeMember")}>
                    <BadgeCheck className='ml-1.5 inline-block h-5 w-5 text-green-500' />
                  </span>
                )}
                {hasLeftClub && (
                  <span title={tm("leftClub")}>
                    <DoorOpen className='ml-1.5 inline-block h-5 w-5 text-muted-foreground' />
                  </span>
                )}
              </h1>
              {activeRole && (
                <Badge className='text-sm' variant='default'>
                  {tPos(activeRole.position as Parameters<typeof tPos>[0]) || activeRole.position}
                  {activeRole.department ? ` · ${activeRole.department.nameVi}` : ""}
                </Badge>
              )}
              {hasLeftClub && (
                <Badge className='text-sm' variant='outline'>
                  {tm("leftClub")}
                </Badge>
              )}
              {isGuest && (
                <Badge className='text-sm' variant='outline'>
                  Guest
                </Badge>
              )}
            </div>

            {!isGuest && (
              <div className='flex flex-wrap items-center gap-2'>
                {activeBadges.map(({ def, result }) => (
                  <BadgeIcon def={def} key={def.id} result={result} />
                ))}
              </div>
            )}

            {isGuest && (
              <div className='flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-amber-600 text-xs'>
                <AlertTriangle className='h-4 w-4 shrink-0' />
                <span>{tm("guestNotice")}</span>
              </div>
            )}
            {hasLeftClub && (
              <div className='flex items-center gap-2 rounded-lg border border-muted-foreground/20 bg-muted/30 px-3 py-2 text-muted-foreground text-xs'>
                <DoorOpen className='h-4 w-4 shrink-0' />
                <span>{tm("leftClubNotice")}</span>
              </div>
            )}
          </div>
          {member.bio && <p className='max-w-2xl text-muted-foreground text-sm'>{member.bio}</p>}
        </div>
      </div>
    </div>
  );
}

export function ProfilePageClient({ member }: { member: Member }) {
  const [activeTab, setActiveTab] = useState("about");
  const locale = useLocale();
  const t = useTranslations("header");
  const tm = useTranslations("header.member");
  const te = useTranslations("events");
  const tPos = useTranslations("userMenu.positions");
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const socials = Array.isArray(member.socials) ? member.socials : [];
  const presentLabel = locale.startsWith("en") ? "Present" : "Hiện tại";

  let joinedDateLabel = "";
  if (member.joinedClubAt) {
    joinedDateLabel = formatLocalDate(member.joinedClubAt, locale);
  } else if (member.clubRoles.length > 0) {
    joinedDateLabel = formatLocalDate(member.clubRoles.at(-1)?.startAt ?? "", locale);
  }

  const activeRole = member.clubRoles.find((r) => !r.endAt);
  const isGuest = member.webRole === "GUEST";
  const hasLeftClub = member.clubRoles.length > 0 && !activeRole;
  const hasBeenLeader = member.clubRoles.some((r) =>
    ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER"].includes(r.position)
  );

  const achievementsCount = member.achievements.length;
  const projectsCount = member.projects.length;
  const postsCount = member.authoredPosts.length;

  const badgeData: BadgeData = useMemo(
    () => ({
      webRole: member.webRole,
      hasLeftClub,
      joinedClubAt: member.joinedClubAt,
      clubRoleStartYears: member.clubRoles.map((r) => new Date(r.startAt).getFullYear()),
      blogPostCount: postsCount,
      achievementCount: achievementsCount,
      projectCount: projectsCount,
      hasBeenLeader
    }),
    [member, hasLeftClub, achievementsCount, projectsCount, postsCount, hasBeenLeader]
  );
  const activeBadges = useMemo(() => getActiveBadges(badgeData), [badgeData]);

  return (
    <div className='min-h-screen bg-muted/30'>
      {/* === COVER PHOTO (3D Parallax) === */}
      <CoverParallax coverImage={member.coverImage} initials={initials}>
        {member.spotifyUri && (
          <div className='pointer-events-none absolute inset-0 z-20'>
            <div className='relative mx-auto h-full w-full max-w-6xl px-4'>
              <div className='pointer-events-auto absolute top-4 right-4'>
                <SpotifyPlayer uri={member.spotifyUri} />
              </div>
            </div>
          </div>
        )}
      </CoverParallax>

      <ScrollReveal once threshold={0} variant='fade-up'>
        <MemberProfileHeader
          activeBadges={activeBadges}
          activeRole={activeRole}
          fullName={fullName}
          hasLeftClub={hasLeftClub}
          initials={initials}
          isGuest={isGuest}
          member={member}
          tm={tm}
          tPos={tPos}
        />
      </ScrollReveal>

      {/* Divider */}
      <div className='mt-2 border-border border-t' />

      {/* === TABS === */}
      <Tabs className='mx-auto mt-4 max-w-6xl px-4' onValueChange={setActiveTab} value={activeTab}>
        <TabsList className='h-auto w-full justify-start gap-1 rounded-none border-border border-b bg-transparent p-0'>
          {[
            { value: "about", label: t("member.tabs.about") },
            {
              value: "posts",
              label: `${t("member.tabs.posts")} (${member.authoredPosts.length})`
            },
            {
              value: "projects",
              label: `${t("member.tabs.projects")} (${member.projects.length})`
            }
          ].map((tab) => (
            <TabsTrigger
              className='rounded-none border-transparent border-b-2 px-6 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-primary'
              key={tab.value}
              value={tab.value}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ABOUT */}
        <TabsContent className='py-8' value='about'>
          <div className='flex flex-col gap-8 lg:flex-row'>
            {/* Left Column */}
            <div className='w-full space-y-8 lg:w-3/4'>
              {/* Basic Info */}
              <ScrollReveal variant='fade-up'>
                <div className='rounded-xl border bg-card p-5 shadow-sm'>
                  <div className='grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2'>
                    <div className='flex items-center gap-3'>
                      <User className='h-4 w-4 shrink-0 text-muted-foreground' />
                      <span className='font-semibold text-sm'>{fullName}</span>
                    </div>
                    {member.studentId && member.showStudentId && (
                      <div className='flex items-center gap-3'>
                        <Hash className='h-4 w-4 shrink-0 text-muted-foreground' />
                        <span className='font-mono font-semibold text-sm'>{member.studentId}</span>
                      </div>
                    )}
                    <div className='flex items-center gap-3'>
                      <Mail className='h-4 w-4 shrink-0 text-muted-foreground' />
                      <span className='truncate text-primary text-sm'>
                        {member.email ||
                          socials.find((s) => s.platform.toLowerCase().includes("mail"))?.url.replace("mailto:", "")}
                      </span>
                    </div>
                    {member.phone && member.showPhone && (
                      <div className='flex items-center gap-3'>
                        <Phone className='h-4 w-4 shrink-0 text-muted-foreground' />
                        <span className='font-semibold text-sm'>{member.phone}</span>
                      </div>
                    )}
                    <div className='flex items-center gap-3'>
                      <Calendar className='h-4 w-4 shrink-0 text-muted-foreground' />
                      <span className='font-semibold text-sm'>{joinedDateLabel}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className='mt-4 border-border border-t pt-4 text-muted-foreground text-sm leading-relaxed'>
                      {member.bio}
                    </p>
                  )}

                  {/* Social links */}
                  {socials.filter((s) => s.url).length > 0 && (
                    <div className='mt-4 flex flex-wrap items-center gap-2 border-border border-t pt-4'>
                      <Globe className='h-4 w-4 text-muted-foreground' />
                      {socials.map((social, index) => {
                        if (!social.url) {
                          return null;
                        }
                        const meta = getSocialMeta(social.platform);
                        const href = buildSocialHref(social.url, meta.prefix);
                        return (
                          <a
                            className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs transition-colors hover:border-primary/50 hover:text-primary'
                            href={href}
                            key={social.id || `${social.platform}-${index}`}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            <Image
                              alt={meta.platform}
                              className='object-contain'
                              height={14}
                              src={meta.icon}
                              width={14}
                            />
                            <span className='font-medium'>{social.platform}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Achievements Timeline */}
              <ScrollReveal variant='fade-up'>
                <div>
                  <h3 className='mb-6 flex items-center gap-2 font-bold text-xl'>
                    <Trophy className='h-5 w-5 text-amber-500' /> {te("recap.timeline.achievement")}
                  </h3>
                  {member.achievements.length === 0 ? (
                    <p className='text-muted-foreground text-sm italic'>{tm("noAchievements")}</p>
                  ) : (
                    <div className='relative ml-3 space-y-8 border-border border-l pl-6 lg:pl-8'>
                      {member.achievements
                        .slice()
                        .sort((a, b) => new Date(b.achievement.date).getTime() - new Date(a.achievement.date).getTime())
                        .map(({ achievement, role }) => (
                          <div className='relative' key={achievement.id}>
                            <div className='absolute top-3 -left-7.75 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm lg:-left-9.75' />

                            <Link
                              className='group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-primary/50 hover:shadow-md sm:flex-row'
                              href={`/${locale}/achievements/${achievement.slug}`}
                            >
                              <div className='relative h-40 shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-48'>
                                {achievement.thumbnail ? (
                                  <Image
                                    alt={achievement.title}
                                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                                    fill
                                    sizes='(min-width: 640px) 192px, 100vw'
                                    src={achievement.thumbnail}
                                  />
                                ) : (
                                  <div className='flex h-full w-full items-center justify-center bg-primary/5'>
                                    <span className='text-4xl text-primary/20'>🏆</span>
                                  </div>
                                )}
                              </div>
                              <div className='flex flex-1 flex-col p-4 sm:p-5'>
                                <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
                                  <div className='flex items-center gap-2'>
                                    <Badge className='text-[10px]' variant='secondary'>
                                      {achievement.type}
                                    </Badge>
                                    {achievement.isHighlight && (
                                      <Badge className='bg-yellow-500 text-[10px] text-black shadow hover:bg-yellow-400'>
                                        {tm("highlight")}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className='whitespace-nowrap text-muted-foreground text-xs'>
                                    {formatLocalDate(achievement.date, locale)}
                                  </span>
                                </div>
                                <h4 className='mb-2 font-bold text-base transition-colors group-hover:text-primary'>
                                  {achievement.title}
                                </h4>
                                {role && (
                                  <div className='mt-auto pt-2'>
                                    <span className='rounded bg-primary/10 px-2 py-1 font-semibold text-[11px] text-primary uppercase'>
                                      {tm("role")} {role}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Roles History */}
            <ScrollReveal className='w-full lg:w-1/4' variant='fade-left'>
              <div>
                <h3 className='mb-6 border-border border-b pb-2 font-bold text-lg'>{t("member.roleHistory")}</h3>
                {member.clubRoles.length === 0 ? (
                  <p className='text-muted-foreground text-sm italic'>{t("member.noRoles")}</p>
                ) : (
                  <div className='relative space-y-0 pl-4'>
                    <div className='absolute top-2 bottom-2 left-1.5 w-px bg-border' />
                    {member.clubRoles.map((role) => {
                      const isActive = !role.endAt;
                      return (
                        <div className='relative flex items-start gap-4 pb-8' key={role.id}>
                          <div
                            className={`relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${isActive ? "border-primary bg-primary" : "border-muted-foreground/50 bg-background"}`}
                          />
                          <div className='flex-1'>
                            <p className='font-bold text-sm'>
                              {tPos(role.position as Parameters<typeof tPos>[0]) || role.position}
                            </p>
                            {role.department && (
                              <p className='mt-0.5 font-semibold text-primary text-xs'>{role.department.nameVi}</p>
                            )}
                            <p className='mt-1 text-muted-foreground text-xs'>
                              {formatLocalDate(role.startAt, locale)} →{" "}
                              {role.endAt ? formatLocalDate(role.endAt, locale) : presentLabel}
                            </p>
                            {role.term && (
                              <Badge className='mt-2 text-[10px]' variant='outline'>
                                NK {role.term}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </TabsContent>

        {/* POSTS */}
        <TabsContent className='py-8' value='posts'>
          {member.authoredPosts.length === 0 ? (
            <p className='py-8 text-center text-muted-foreground'>{t("member.noPosts")}</p>
          ) : (
            <div className='grid gap-6 sm:grid-cols-2'>
              {member.authoredPosts.map((post, idx) => (
                <ScrollReveal delay={(idx % 8) * 60} key={post.id} variant='fade-up'>
                  <PostCard
                    data={{
                      id: post.id,
                      slug: post.slug,
                      variant: "blog",
                      titleVi: post.titleVi,
                      titleEn: post.titleEn,
                      summaryVi: post.summaryVi,
                      summaryEn: post.summaryEn,
                      thumbnail: post.thumbnail,
                      date: post.publishedAt,
                      href: `/blogs/${post.slug}`
                    }}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent className='py-6' value='projects'>
          {member.projects.length === 0 ? (
            <p className='py-8 text-center text-muted-foreground'>{t("member.noProjects")}</p>
          ) : (
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {member.projects.map(({ project, role }, idx) => (
                <ScrollReveal delay={(idx % 8) * 60} key={project.id} variant='fade-up'>
                  <PostCard
                    data={{
                      id: project.id,
                      slug: project.slug,
                      variant: "project",
                      titleVi: project.title,
                      titleEn: project.titleEn,
                      summaryVi: project.description,
                      summaryEn: project.descriptionEn,
                      thumbnail: project.thumbnail,
                      technologies: project.technologies,
                      memberRole: role,
                      startDate: project.startDate ?? null,
                      endDate: project.endDate ?? null,
                      contributors:
                        project.members?.map((m) => ({
                          id: m.member.id,
                          firstName: m.member.firstName,
                          lastName: m.member.lastName,
                          avatar: m.member.avatar,
                          slug: m.member.slug
                        })) ?? [],
                      href: `/projects/${project.slug}`
                    }}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
