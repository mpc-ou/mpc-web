"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  User2,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AchievementMember = {
  role: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
};

type Achievement = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  date: Date;
  type: string;
  isHighlight: boolean;
  relatedUrl: string | null;
  members: AchievementMember[];
};

export function AchievementsClient({
  achievements,
  currentPage,
  totalPages,
}: {
  achievements: Achievement[];
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      {/* Grid */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item) => (
          <div
            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            key={item.id}
            onClick={() => router.push(`/achievements/${item.slug || item.id}`)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={item.thumbnail}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                  <TrophyPlaceholder />
                </div>
              )}
              {item.isHighlight && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-yellow-500 text-black hover:bg-yellow-400">
                    ⭐ Nổi bật
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Preview */}
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(item.date).toLocaleDateString("vi-VN")}
                </span>
                <span className="flex items-center gap-1 border-border border-l pl-2">
                  {item.type === "INDIVIDUAL" ? (
                    <User2 className="h-3.5 w-3.5" />
                  ) : (
                    <Users className="h-3.5 w-3.5" />
                  )}
                  {item.type === "INDIVIDUAL"
                    ? "Cá nhân"
                    : item.type === "TEAM"
                      ? "Nhóm"
                      : "Tập thể"}
                </span>
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="mb-2 line-clamp-2 font-bold text-lg group-hover:text-primary">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="line-clamp-3 flex-1 text-muted-foreground text-sm">
                    {item.summary}
                  </p>
                )}
              </div>

              {/* Members Footer */}
              {item.members && item.members.length > 0 && (
                <div className="mt-4 flex items-center border-border border-t pt-4">
                  <div className="flex -space-x-3">
                    {item.members.slice(0, 5).map((m, idx) => (
                      <div
                        className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm"
                        key={m.member.id}
                        style={{ zIndex: 10 - idx }}
                        title={`${m.member.lastName} ${m.member.firstName}`}
                      >
                        {m.member.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={m.member.firstName}
                            className="h-full w-full object-cover"
                            src={m.member.avatar}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-[10px] text-muted-foreground uppercase">
                            {m.member.firstName[0]}
                          </div>
                        )}
                      </div>
                    ))}
                    {item.members.length > 5 && (
                      <div className="relative z-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted shadow-sm">
                        <span className="font-medium text-[10px] text-muted-foreground">
                          +{item.members.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {achievements.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Chưa có thành tựu nào được cập nhật.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            size="icon"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-16 text-center font-medium text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            size="icon"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}

const TrophyPlaceholder = () => (
  <svg
    fill="none"
    height="48"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
