"use client";

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

const getSocialMeta = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("facebook") || p === "fb") return { icon: "📘", prefix: "" };
  if (p.includes("twitter") || p === "x") return { icon: "𝕏", prefix: "" };
  if (p.includes("linkedin")) return { icon: "💼", prefix: "" };
  if (p.includes("github")) return { icon: "🐙", prefix: "" };
  if (p.includes("email") || p.includes("mail"))
    return { icon: "✉️", prefix: "mailto:" };
  if (p.includes("instagram") || p === "ig") return { icon: "📸", prefix: "" };
  if (p.includes("tiktok")) return { icon: "🎵", prefix: "" };
  if (p.includes("youtube") || p === "yt") return { icon: "▶️", prefix: "" };
  if (p.includes("zalo")) return { icon: "💬", prefix: "" };
  if (p.includes("pixiv")) return { icon: "🎨", prefix: "" };
  if (p.includes("discord")) return { icon: "👾", prefix: "" };
  if (p.includes("website") || p.includes("web") || p.includes("khác"))
    return { icon: "🌐", prefix: "" };
  return { icon: "🌐", prefix: "" };
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
      description: string | null;
      technologies: string[];
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
  const fullName = `${member.firstName} ${member.lastName}`;
  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const socials = Array.isArray(member.socials) ? member.socials : [];

  // Active role
  const activeRole = member.clubRoles.find((r) => !r.endAt);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* === COVER PHOTO === */}
      <div className="relative h-[280px] w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-muted md:h-[360px]">
        {member.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Cover"
            className="h-full w-full object-cover"
            src={member.coverImage}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-[120px] opacity-10 select-none">
              {initials}
            </div>
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* === PROFILE HEADER === */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative -mt-16 flex flex-col gap-4 md:-mt-20 md:flex-row md:items-end">
          {/* Avatar — overlaps cover */}
          <div className="shrink-0">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl md:h-40 md:w-40">
              <AvatarImage src={member.avatar ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-4xl font-bold text-primary">
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
              <p className="text-muted-foreground max-w-2xl text-sm">
                {member.bio}
              </p>
            )}

            {/* Social links row */}
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socials.map((social) => {
                  if (!social.url) return null;
                  const meta = getSocialMeta(social.platform);
                  const href = meta.prefix
                    ? `${meta.prefix}${social.url}`
                    : social.url.startsWith("http")
                      ? social.url
                      : `https://${social.url}`;
                  return (
                    <a
                      className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors"
                      href={href}
                      key={social.id || social.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span>{meta.icon}</span>
                      <span className="hidden sm:inline">
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
        <div className="mt-2 border-t border-border" />

        {/* === TABS === */}
        <Tabs className="mt-4" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0 border-b border-border rounded-none h-auto">
            {[
              { value: "about", label: "Giới thiệu" },
              { value: "roles", label: `Chức vụ (${member.clubRoles.length})` },
              {
                value: "achievements",
                label: `Thành tựu (${member.achievements.length})`,
              },
              { value: "projects", label: `Dự án (${member.projects.length})` },
              {
                value: "posts",
                label: `Bài viết (${member.authoredPosts.length})`,
              },
            ].map((tab) => (
              <TabsTrigger
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-primary"
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ABOUT */}
          <TabsContent className="py-6" value="about">
            <div className="grid gap-4 sm:grid-cols-2">
              {member.studentId && (
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
                    Mã sinh viên
                  </p>
                  <p className="font-mono text-sm">{member.studentId}</p>
                </div>
              )}
              {member.joinedClubAt && (
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
                    Tham gia CLB
                  </p>
                  <p className="text-sm">
                    {new Date(member.joinedClubAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
              <div className="rounded-lg border bg-card p-4">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
                  Vai trò hệ thống
                </p>
                <Badge variant="outline">{member.webRole}</Badge>
              </div>
            </div>
          </TabsContent>

          {/* CLUB ROLES */}
          <TabsContent className="py-6" value="roles">
            {member.clubRoles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Chưa có lịch sử chức vụ
              </p>
            ) : (
              <div className="relative space-y-0 pl-5">
                <div className="absolute top-2 bottom-2 left-[9px] w-px bg-border" />
                {member.clubRoles.map((role) => {
                  const isActive = !role.endAt;
                  return (
                    <div
                      className="relative flex items-start gap-4 pb-6"
                      key={role.id}
                    >
                      <div
                        className={`relative z-10 mt-1. 5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${isActive ? "border-primary bg-primary" : "border-muted-foreground/50 bg-background"}`}
                      />
                      <div className="rounded-lg border bg-card flex-1 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">
                              {POSITION_LABELS[role.position] ?? role.position}
                            </p>
                            {role.department && (
                              <p className="text-muted-foreground text-sm">
                                📌 {role.department.name}
                              </p>
                            )}
                            <p className="text-muted-foreground text-xs mt-1">
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
                            {role.note && (
                              <p className="text-muted-foreground text-xs italic mt-1">
                                {role.note}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-wrap justify-end">
                            {isActive && <Badge>Hiện tại</Badge>}
                            {role.term && (
                              <Badge variant="outline">NK {role.term}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ACHIEVEMENTS */}
          <TabsContent className="py-6" value="achievements">
            {member.achievements.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Chưa có thành tựu nào
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {member.achievements.map(({ achievement, role }) => (
                  <div
                    className="rounded-lg border bg-card p-4 space-y-1"
                    key={achievement.id}
                  >
                    {achievement.isHighlight && (
                      <span className="text-lg">⭐</span>
                    )}
                    <p className="font-semibold text-sm">{achievement.title}</p>
                    {role && (
                      <p className="text-muted-foreground text-xs">
                        Vai trò: {role}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {new Date(achievement.date).toLocaleDateString("vi-VN")}
                    </p>
                    <Badge className="text-[10px]" variant="outline">
                      {achievement.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* PROJECTS */}
          <TabsContent className="py-6" value="projects">
            {member.projects.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Chưa có dự án nào
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {member.projects.map(({ project, role }) => (
                  <div
                    className="rounded-lg border bg-card p-4 space-y-2"
                    key={project.id}
                  >
                    <p className="font-semibold">{project.title}</p>
                    {project.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {role && (
                      <p className="text-muted-foreground text-xs">
                        Vai trò: {role}
                      </p>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((t) => (
                          <span
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px]"
                            key={t}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* POSTS */}
          <TabsContent className="py-6" value="posts">
            {member.authoredPosts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Chưa có bài viết nào
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {member.authoredPosts.map((post) => (
                  <a
                    className="rounded-lg border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors block"
                    href={`/posts/${post.slug}`}
                    key={post.id}
                  >
                    <p className="font-semibold line-clamp-2">{post.title}</p>
                    {post.publishedAt && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </a>
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
