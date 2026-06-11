"use client";

import {
  Calendar,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { BadgeIcon, getActiveBadges } from "@/components/custom/badge-icon";
import { CoverParallax } from "@/components/custom/cover-parallax";
import { SpotifyPlayer } from "@/components/custom/spotify-player";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BadgeData } from "@/configs/badges";
import { useTransparentHeader } from "@/hooks/use-transparent-header";
import { formatLocalDate } from "@/utils/handle-datetime";

const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm CLB",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban",
  DEPARTMENT_MEMBER: "Thành viên ban",
  COLLABORATOR: "Cộng tác viên",
  ADVISOR: "Cố vấn",
};

import { SOCIAL_COLLECTION } from "@/constants/common";
import { getFullName } from "@/lib/utils";

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

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  phone: string | null;
  email: string;
  studentId: string | null;
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

export function ProfilePageClient({ member }: { member: Member }) {
  const [activeTab, setActiveTab] = useState("about");
  const locale = useLocale();
  const t = useTranslations("header");
  const te = useTranslations("events");
  // useTransparentHeader();
  const fullName = getFullName(member.firstName, member.lastName, locale);
  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const socials = Array.isArray(member.socials) ? member.socials : [];

  // Active role
  const activeRole = member.clubRoles.find((r) => !r.endAt);

  const isGuest = member.webRole === "GUEST";
  const hasLeftClub = member.clubRoles.length > 0 && !activeRole;
  const hasBeenLeader = member.clubRoles.some((r) =>
    ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER"].includes(r.position),
  );

  const achievementsCount = member.achievements.length;
  const projectsCount = member.projects.length;
  const postsCount = member.authoredPosts.length;

  const badgeData: BadgeData = useMemo(
    () => ({
      webRole: member.webRole,
      hasLeftClub,
      joinedClubAt: member.joinedClubAt,
      clubRoleStartYears: member.clubRoles.map((r) =>
        new Date(r.startAt).getFullYear(),
      ),
      blogPostCount: postsCount,
      achievementCount: achievementsCount,
      projectCount: projectsCount,
      hasBeenLeader,
    }),
    [
      member,
      hasLeftClub,
      achievementsCount,
      projectsCount,
      postsCount,
      hasBeenLeader,
    ],
  );
  const activeBadges = useMemo(() => getActiveBadges(badgeData), [badgeData]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* === COVER PHOTO (3D Parallax) === */}
      <CoverParallax coverImage={member.coverImage} initials={initials}>
        {member.spotifyUri && (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div className="relative mx-auto h-full w-full max-w-6xl px-4">
              <div className="pointer-events-auto absolute top-4 right-4">
                <SpotifyPlayer uri={member.spotifyUri} />
              </div>
            </div>
          </div>
        )}
      </CoverParallax>

      {/* === PROFILE HEADER === */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative -mt-16 flex flex-col gap-4 md:-mt-20 md:flex-row md:items-end">
          {/* Avatar — overlaps cover */}
          <div className="shrink-0">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl md:h-40 md:w-40">
              <AvatarImage src={member.avatar ?? undefined} />
              <AvatarFallback className="bg-primary/10 font-bold text-4xl text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name + role + socials */}
          <div className="flex flex-1 flex-col gap-2 pb-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-bold text-3xl text-foreground">
                  {fullName}
                  {!(isGuest || hasLeftClub) && (
                    <span
                      className="ml-1.5 inline-flex items-center"
                      title="Thành viên đang hoạt động"
                    >
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </span>
                  )}
                </h1>
                {activeRole && (
                  <Badge className="text-sm" variant="default">
                    {POSITION_LABELS[activeRole.position] ??
                      activeRole.position}
                    {activeRole.department
                      ? ` · ${activeRole.department.nameVi}`
                      : ""}
                  </Badge>
                )}
              </div>

              {/* Activity Badges */}
              {!isGuest && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeBadges.map(({ def, result }) => (
                    <BadgeIcon def={def} key={def.id} result={result} />
                  ))}
                </div>
              )}
            </div>
            {member.bio && (
              <p className="max-w-2xl text-muted-foreground text-sm">
                {member.bio}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-2 border-border border-t" />

        {/* === TABS === */}
        <Tabs className="mt-4" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-border border-b bg-transparent p-0">
            {[
              { value: "about", label: t("member.tabs.about") },
              {
                value: "posts",
                label: `${t("member.tabs.posts")} (${member.authoredPosts.length})`,
              },
              {
                value: "projects",
                label: `${t("member.tabs.projects")} (${member.projects.length})`,
              },
            ].map((tab) => (
              <TabsTrigger
                className="rounded-none border-transparent border-b-2 px-6 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-primary"
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ABOUT */}
          <TabsContent className="py-8" value="about">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Left Column */}
              <div className="w-full space-y-8 lg:w-3/4">
                {/* Basic Info — Compact grid with icons */}
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-semibold text-sm">{fullName}</span>
                    </div>
                    {member.studentId && (
                      <div className="flex items-center gap-3">
                        <svg
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 7V4h16v3" />
                          <path d="M9 20h6" />
                          <path d="M12 4v16" />
                        </svg>
                        <span className="font-mono font-semibold text-sm">
                          {member.studentId}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-primary text-sm">
                        {member.email ||
                          socials
                            .find((s) =>
                              s.platform.toLowerCase().includes("mail"),
                            )
                            ?.url.replace("mailto:", "")}
                      </span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {member.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {member.joinedClubAt
                          ? formatLocalDate(member.joinedClubAt, locale)
                          : member.clubRoles.length > 0
                            ? formatLocalDate(
                                member.clubRoles.at(-1)?.startAt ?? "",
                                locale,
                              )
                            : ""}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="mt-4 border-border border-t pt-4 text-muted-foreground text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Social links — inline icons */}
                  {socials.filter((s) => s.url).length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-border border-t pt-4">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {socials.map((social, index) => {
                        if (!social.url) {
                          return null;
                        }
                        const meta = getSocialMeta(social.platform);
                        const href =
                          social.url.startsWith("http") ||
                          social.url.startsWith("mailto:")
                            ? social.url
                            : meta.prefix
                              ? `${meta.prefix}${social.url}`
                              : `https://${social.url}`;
                        return (
                          <a
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs transition-colors hover:border-primary/50 hover:text-primary"
                            href={href}
                            key={social.id || `${social.platform}-${index}`}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <img
                              alt={meta.platform}
                              className="h-3.5 w-3.5 object-contain"
                              src={meta.icon}
                            />
                            <span className="font-medium">
                              {social.platform}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Achievements Timeline */}
                <div>
                  <h3 className="mb-6 flex items-center gap-2 font-bold text-xl">
                    <Trophy className="h-5 w-5 text-amber-500" />{" "}
                    {te("recap.timeline.achievement")}
                  </h3>
                  {member.achievements.length === 0 ? (
                    <p className="text-muted-foreground text-sm italic">
                      Chưa có thành tựu nào được ghi nhận.
                    </p>
                  ) : (
                    <div className="relative ml-3 space-y-8 border-border border-l pl-6 lg:pl-8">
                      {member.achievements
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.achievement.date).getTime() -
                            new Date(a.achievement.date).getTime(),
                        )
                        .map(({ achievement, role }) => (
                          <div className="relative" key={achievement.id}>
                            <div className="absolute top-3 -left-7.75 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm lg:-left-9.75" />

                            <Link
                              className="group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-primary/50 hover:shadow-md sm:flex-row"
                              href={`/${locale}/achievements/${achievement.slug}`}
                            >
                              <div className="relative h-40 shrink-0 overflow-hidden bg-muted sm:h-auto sm:w-48">
                                {achievement.thumbnail ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    alt={achievement.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    src={achievement.thumbnail}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                    <span className="text-4xl text-primary/20">
                                      🏆
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-1 flex-col p-4 sm:p-5">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className="text-[10px]"
                                      variant="secondary"
                                    >
                                      {achievement.type}
                                    </Badge>
                                    {achievement.isHighlight && (
                                      <Badge className="bg-yellow-500 text-[10px] text-black shadow hover:bg-yellow-400">
                                        ⭐ Nổi bật
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="whitespace-nowrap text-muted-foreground text-xs">
                                    {formatLocalDate(achievement.date, locale)}
                                  </span>
                                </div>
                                <h4 className="mb-2 font-bold text-base transition-colors group-hover:text-primary">
                                  {achievement.title}
                                </h4>
                                {role && (
                                  <div className="mt-auto pt-2">
                                    <span className="rounded bg-primary/10 px-2 py-1 font-semibold text-[11px] text-primary uppercase">
                                      Vai trò: {role}
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
              </div>

              {/* Right Column: Roles History */}
              <div className="w-full lg:w-1/4">
                <h3 className="mb-6 border-border border-b pb-2 font-bold text-lg">
                  {t("member.roleHistory")}
                </h3>
                {member.clubRoles.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    {t("member.noRoles")}
                  </p>
                ) : (
                  <div className="relative space-y-0 pl-4">
                    <div className="absolute top-2 bottom-2 left-1.5 w-px bg-border" />
                    {member.clubRoles.map((role) => {
                      const isActive = !role.endAt;
                      return (
                        <div
                          className="relative flex items-start gap-4 pb-8"
                          key={role.id}
                        >
                          <div
                            className={`relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${isActive ? "border-primary bg-primary" : "border-muted-foreground/50 bg-background"}`}
                          />
                          <div className="flex-1">
                            <p className="font-bold text-sm">
                              {POSITION_LABELS[role.position] ?? role.position}
                            </p>
                            {role.department && (
                              <p className="mt-0.5 font-semibold text-primary text-xs">
                                {role.department.nameVi}
                              </p>
                            )}
                            <p className="mt-1 text-muted-foreground text-xs">
                              {formatLocalDate(role.startAt, locale)} →{" "}
                              {role.endAt
                                ? formatLocalDate(role.endAt, locale)
                                : locale.startsWith("en")
                                  ? "Present"
                                  : "Hiện tại"}
                            </p>
                            {role.term && (
                              <Badge
                                className="mt-2 text-[10px]"
                                variant="outline"
                              >
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
            </div>
          </TabsContent>

          {/* POSTS */}
          <TabsContent className="py-8" value="posts">
            {member.authoredPosts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {t("member.noPosts")}
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {member.authoredPosts.map((post) => (
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
                      href: `/blogs/${post.slug}`,
                    }}
                    key={post.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent className="py-6" value="projects">
            {member.projects.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {t("member.noProjects")}
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {member.projects.map(({ project, role }) => (
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
                        (project as any).members?.map((m: any) => ({
                          id: m.member.id,
                          firstName: m.member.firstName,
                          lastName: m.member.lastName,
                          avatar: m.member.avatar,
                          slug: m.member.slug,
                        })) ?? [],
                      href: `/projects/${project.slug}`,
                    }}
                    key={project.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
