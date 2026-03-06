"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      title: string;
      slug: string;
      description: string | null;
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
    title: string;
    publishedAt: string | null;
    slug: string;
  }[];
};

export function ProfilePageClient({ member }: { member: Member }) {
  const [activeTab, setActiveTab] = useState("about");
  const locale = useLocale();
  const fullName = getFullName(member.firstName, member.lastName, locale);
  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const socials = Array.isArray(member.socials) ? member.socials : [];

  // Active role
  const activeRole = member.clubRoles.find((r) => !r.endAt);

  const isGuest = member.webRole === "GUEST";
  const hasLeftClub = member.clubRoles.length > 0 && !activeRole;
  const oldestRoleYear =
    member.clubRoles.length > 0
      ? new Date(
          member.clubRoles[member.clubRoles.length - 1].startAt,
        ).getFullYear()
      : member.joinedClubAt
        ? new Date(member.joinedClubAt).getFullYear()
        : new Date().getFullYear();
  const activeYears = Math.max(1, new Date().getFullYear() - oldestRoleYear);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* === COVER PHOTO === */}
      <div className="relative h-70 w-full overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-muted md:h-90">
        {member.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Cover"
            className="h-full w-full object-cover"
            src={member.coverImage}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="select-none text-[120px] opacity-10">
              {initials}
            </div>
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background/80 to-transparent" />
      </div>

      {/* === PROFILE HEADER === */}
      <div className="mx-auto max-w-5xl px-4">
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
                <div className="flex flex-wrap gap-2 text-sm">
                  {hasLeftClub ? (
                    <Badge
                      className="bg-muted text-muted-foreground hover:bg-muted/80"
                      variant="secondary"
                    >
                      🚪 Đã rời CLB
                    </Badge>
                  ) : (
                    <Badge
                      className="border-primary/50 bg-primary/5 text-primary"
                      variant="outline"
                    >
                      🎖 Thành viên CLB • {activeYears} năm hoạt động
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {member.bio && (
              <p className="max-w-2xl text-muted-foreground text-sm">
                {member.bio}
              </p>
            )}

            {/* Social links row */}
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-3">
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
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                      href={href}
                      key={social.id || `${social.platform}-${index}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <img
                        alt={meta.platform}
                        className="h-4 w-4 object-contain"
                        src={meta.icon}
                      />
                      <span className="hidden font-medium sm:inline">
                        {social.platform || "Link"}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-2 border-border border-t" />

        {/* === TABS === */}
        <Tabs className="mt-4" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-border border-b bg-transparent p-0">
            {[
              { value: "about", label: "Giới thiệu" },
              { value: "projects", label: `Dự án (${member.projects.length})` },
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
              {/* Left Column: Info & Achievements */}
              <div className="w-full space-y-8 lg:w-3/4">
                {/* Basic Info */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="w-32 shrink-0 font-medium text-muted-foreground">
                        Họ và Tên
                      </span>
                      <span className="font-semibold">{fullName}</span>
                    </li>
                    {member.studentId && (
                      <li className="flex items-start gap-3">
                        <span className="w-32 shrink-0 font-medium text-muted-foreground">
                          Mã sinh viên
                        </span>
                        <span className="font-mono font-semibold">
                          {member.studentId}
                        </span>
                      </li>
                    )}
                    {(member.email ||
                      socials.find((s) =>
                        s.platform.toLowerCase().includes("mail"),
                      )) && (
                      <li className="flex items-start gap-3">
                        <span className="w-32 shrink-0 font-medium text-muted-foreground">
                          Email
                        </span>
                        <span className="max-w-full truncate font-semibold text-primary">
                          {member.email ||
                            socials
                              .find((s) =>
                                s.platform.toLowerCase().includes("mail"),
                              )
                              ?.url.replace("mailto:", "")}
                        </span>
                      </li>
                    )}
                    {member.phone && (
                      <li className="flex items-start gap-3">
                        <span className="w-32 shrink-0 font-medium text-muted-foreground">
                          Số điện thoại
                        </span>
                        <span className="font-semibold">{member.phone}</span>
                      </li>
                    )}
                    {(member.joinedClubAt || member.clubRoles.length > 0) && (
                      <li className="flex items-start gap-3">
                        <span className="w-32 shrink-0 font-medium text-muted-foreground">
                          Tham gia từ
                        </span>
                        <span className="font-semibold">
                          {member.joinedClubAt
                            ? new Date(member.joinedClubAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : member.clubRoles.length > 0
                              ? new Date(
                                  member.clubRoles[member.clubRoles.length - 1]
                                    .startAt,
                                ).toLocaleDateString("vi-VN")
                              : ""}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Achievements Timeline */}
                <div>
                  <h3 className="mb-6 flex items-center gap-2 font-bold text-xl">
                    <span className="text-2xl">🏆</span> Thành tựu nổi bật
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
                            <div className="absolute top-3 -left-[31px] h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm lg:-left-[39px]" />

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
                                    {new Date(
                                      achievement.date,
                                    ).toLocaleDateString("vi-VN")}
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
                  Lịch sử chức vụ
                </h3>
                {member.clubRoles.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    Chưa ghi nhận chức vụ.
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
                              {new Date(role.startAt).toLocaleDateString(
                                "vi-VN",
                              )}{" "}
                              →{" "}
                              {role.endAt
                                ? new Date(role.endAt).toLocaleDateString(
                                    "vi-VN",
                                  )
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

          {/* PROJECTS */}
          <TabsContent className="py-6" value="projects">
            {member.projects.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Chưa có dự án nào
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {member.projects.map(({ project, role }) => (
                  <Link
                    className="group overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-primary/50 hover:shadow-md"
                    href={`/${locale}/projects/${project.slug}`}
                    key={project.id}
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      {project.thumbnail ? (
                        <img
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={project.thumbnail}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/5">
                          <span className="text-4xl text-primary/20">🚀</span>
                        </div>
                      )}
                    </div>
                    <div className="flex h-[180px] flex-col p-5">
                      <h4 className="mb-2 line-clamp-1 font-bold text-lg transition-colors group-hover:text-primary">
                        {project.title}
                      </h4>
                      {project.description && (
                        <p className="mb-4 line-clamp-2 flex-grow text-muted-foreground text-sm">
                          {project.description}
                        </p>
                      )}

                      <div className="mt-auto space-y-3">
                        {role && (
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-primary/10 px-2 py-1 font-semibold text-primary text-xs">
                              Vai trò: {role}
                            </span>
                          </div>
                        )}
                        {project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.technologies.slice(0, 3).map((t) => (
                              <Badge
                                className="text-[10px]"
                                key={t}
                                variant="secondary"
                              >
                                {t}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge className="text-[10px]" variant="outline">
                                +{project.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}
