"use client";

import { useState } from "react";
import {
  type ProjectDetail,
  ProjectDetailDialog,
} from "@/components/project-detail-dialog";
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

const getSocialMeta = (platform: string) => {
  const p = platform.toLowerCase();

  if (p.includes("facebook") || p === "fb") return SOCIAL_COLLECTION.FACEBOOK;
  if (p.includes("twitter") || p === "x") return SOCIAL_COLLECTION.TWITTER;
  if (p.includes("linkedin")) return SOCIAL_COLLECTION.LINKEDIN;
  if (p.includes("github")) return SOCIAL_COLLECTION.GITHUB;
  if (p.includes("instagram") || p === "ig") return SOCIAL_COLLECTION.INSTAGRAM;
  if (p.includes("tiktok")) return SOCIAL_COLLECTION.TIKTOK;
  if (p.includes("youtube") || p === "yt") return SOCIAL_COLLECTION.YOUTUBE;
  if (p.includes("discord")) return SOCIAL_COLLECTION.DISCORD;
  if (p.includes("email") || p.includes("mail")) return SOCIAL_COLLECTION.EMAIL;

  return SOCIAL_COLLECTION.WEBSITE;
};

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
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
    department: { name: string } | null;
  }[];
  achievements: {
    role: string | null;
    achievement: {
      id: string;
      title: string;
      date: string;
      type: string;
      isHighlight: boolean;
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
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(
    null,
  );
  const fullName = `${member.firstName} ${member.lastName}`;
  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const socials = Array.isArray(member.socials) ? member.socials : [];

  // Active role
  const activeRole = member.clubRoles.find((r) => !r.endAt);

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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-bold text-3xl text-foreground">{fullName}</h1>
              {activeRole && (
                <Badge className="text-sm" variant="default">
                  {POSITION_LABELS[activeRole.position] ?? activeRole.position}
                  {activeRole.department
                    ? ` · ${activeRole.department.name}`
                    : ""}
                </Badge>
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
                        src={meta.icon}
                        alt={meta.platform}
                        className="w-4 h-4 object-contain"
                      />
                      <span className="hidden sm:inline font-medium">
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
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Info & Achievements */}
              <div className="w-full lg:w-3/4 space-y-8">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="mb-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                      Họ và Tên
                    </p>
                    <p className="font-semibold text-sm">{fullName}</p>
                  </div>

                  {member.studentId && (
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                      <p className="mb-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                        Mã sinh viên
                      </p>
                      <p className="font-mono text-sm font-semibold">
                        {member.studentId}
                      </p>
                    </div>
                  )}

                  {member.joinedClubAt && (
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                      <p className="mb-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                        Tham gia CLB
                      </p>
                      <p className="text-sm font-semibold">
                        {new Date(member.joinedClubAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  )}

                  {/* Extracting Email and Phone from socials if present */}
                  {member.socials?.find((s) =>
                    s.platform.toLowerCase().includes("mail"),
                  ) && (
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                      <p className="mb-2 font-medium text-muted-foreground text-[11px] uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-semibold truncate">
                        {member.socials
                          .find((s) =>
                            s.platform.toLowerCase().includes("mail"),
                          )
                          ?.url.replace("mailto:", "")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Achievements Timeline */}
                <div>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="text-2xl">🏆</span> Thành tựu nổi bật
                  </h3>
                  {member.achievements.length === 0 ? (
                    <p className="text-muted-foreground italic text-sm">
                      Chưa có thành tựu nào được ghi nhận.
                    </p>
                  ) : (
                    <div className="relative border-l border-border pl-6 ml-3 space-y-8">
                      {member.achievements
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(b.achievement.date).getTime() -
                            new Date(a.achievement.date).getTime(),
                        )
                        .map(({ achievement, role }) => (
                          <div className="relative" key={achievement.id}>
                            <div className="absolute -left-8 top-1 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                              <h4 className="font-bold text-base flex items-center gap-2">
                                {achievement.title}
                                {achievement.isHighlight && (
                                  <span title="Nổi bật">⭐</span>
                                )}
                              </h4>
                              <span className="text-muted-foreground text-xs whitespace-nowrap">
                                {new Date(achievement.date).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {achievement.type}
                              </Badge>
                              {role && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  Vai trò: {role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Roles History */}
              <div className="w-full lg:w-1/4">
                <h3 className="text-lg font-bold mb-6 border-b border-border pb-2">
                  Lịch sử chức vụ
                </h3>
                {member.clubRoles.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm">
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
                              <p className="text-primary text-xs font-semibold mt-0.5">
                                {role.department.name}
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
                                variant="outline"
                                className="mt-2 text-[10px]"
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
                  <button
                    className="group cursor-pointer overflow-hidden rounded-xl border bg-card text-left transition-all hover:border-primary/50 hover:shadow-md"
                    key={project.id}
                    onClick={() =>
                      setSelectedProject({
                        ...project,
                        viewerRole: role,
                      })
                    }
                    type="button"
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
                    <div className="p-5 flex flex-col h-[180px]">
                      <h4 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                      {project.description && (
                        <p className="line-clamp-2 text-muted-foreground text-sm mb-4 flex-grow">
                          {project.description}
                        </p>
                      )}

                      <div className="mt-auto space-y-3">
                        {role && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                              Vai trò: {role}
                            </span>
                          </div>
                        )}
                        {project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.technologies.slice(0, 3).map((t) => (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                                key={t}
                              >
                                {t}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{project.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Project detail modal */}
      <ProjectDetailDialog
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProject(null);
          }
        }}
        open={!!selectedProject}
        project={selectedProject}
      />

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}
