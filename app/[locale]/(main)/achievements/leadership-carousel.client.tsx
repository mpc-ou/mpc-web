"use client";

import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  FolderGit2,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import { useTranslations } from "next-intl";

type Role = {
  id: string;
  position: string;
  startAt: string;
  endAt: string | null;
  departmentName: string | null;
};

type Leader = {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    slug: string;
    socials: any;
    coverImage?: string | null;
    _count?: {
      achievements: number;
      projects: number;
    };
  };
  roles: Role[];
};

export function LeadershipCarouselClient({ leaders }: { leaders: Leader[] }) {
  const t = useTranslations("achievements");
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.children[
        currentIndex
      ] as HTMLElement | undefined;
      if (activeElement) {
        const container = scrollContainerRef.current;
        const scrollTarget =
          activeElement.offsetLeft -
          container.offsetWidth / 2 +
          activeElement.offsetWidth / 2;
        container.scrollTo({
          left: scrollTarget,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((c) => (c === 0 ? leaders.length - 1 : c - 1));
  }, [leaders.length]);

  const next = useCallback(() => {
    setCurrentIndex((c) => (c === leaders.length - 1 ? 0 : c + 1));
  }, [leaders.length]);

  useEffect(() => {
    if (leaders.length <= 1) {
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((c) => (c === leaders.length - 1 ? 0 : c + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [leaders.length]);

  if (leaders.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {t("leadership.emptyData")}
      </div>
    );
  }

  const activeLeader = leaders[currentIndex];

  const getCoverImage = (leader: Leader) => {
    return leader.member.coverImage || "/images/bg/bg_achievements.jpg";
  };

  return (
    <section className="relative flex h-[80vh] min-h-[600px] w-full flex-col overflow-hidden border-border border-y bg-black">
      {leaders.map((leader, index) => (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "z-0 opacity-100" : "z-0 opacity-0"
          }`}
          key={leader.member.id}
        >
          <Image
            alt={`${leader.member.lastName} ${leader.member.firstName}`}
            className="object-cover"
            fill
            priority={index === 0}
            src={getCoverImage(leader)}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
      ))}

      <div className="container relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col py-10 lg:py-16">
        {/* Top/Main Content Area */}
        <div className="flex flex-1 flex-col justify-center">
          <div
            className="fade-in slide-in-from-bottom-8 w-full animate-in duration-700"
            key={`content-${activeLeader.member.id}`}
          >
            {/* Header / Name and Avatar */}
            <div className="mb-6 flex flex-col-reverse md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-end gap-6 uppercase tracking-widest text-[#FFF700] mb-2 font-mono text-xs font-bold">
                  <span>[ REC ]</span>
                  <span className="opacity-80">
                    {activeLeader.roles[0]?.position
                      ? (t as any)(
                          `leadership.positions.${activeLeader.roles[0].position}`,
                        )
                      : t("leadership.leader")}
                  </span>
                  <span className="opacity-80">
                    {currentIndex + 1} / {leaders.length}
                  </span>
                </div>
                <h2
                  className="text-balance font-bold text-4xl text-white tracking-tight sm:text-5xl lg:text-6xl"
                  style={{ textShadow: "0px 2px 8px rgba(0,0,0,0.8)" }}
                >
                  {activeLeader.member.firstName}{" "}
                  <br className="hidden md:block" />
                  {activeLeader.member.lastName}
                </h2>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-white backdrop-blur-sm">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span>
                      {activeLeader.member._count?.achievements || 0}{" "}
                      {t("leadership.achievementsCount", {
                        defaultValue: "Thành tựu",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-white backdrop-blur-sm">
                    <FolderGit2 className="h-4 w-4 text-blue-400" />
                    <span>
                      {activeLeader.member._count?.projects || 0}{" "}
                      {t("leadership.projectsCount", { defaultValue: "Dự án" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Avatar */}
              <div className="shrink-0 mb-2 md:mb-0">
                {activeLeader.member.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={activeLeader.member.firstName}
                    className="h-20 w-20 md:h-56 md:w-56 rounded-full border-2 border-primary object-cover shadow-xl"
                    src={activeLeader.member.avatar}
                  />
                ) : (
                  <div className="flex h-20 w-20 md:h-56 md:w-56 items-center justify-center rounded-full border-2 border-primary bg-muted font-bold text-2xl md:text-4xl text-foreground shadow-xl">
                    {activeLeader.member.firstName[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="mb-6 h-[2px] w-24 bg-gradient-to-r from-primary to-transparent" />

            {/* Timeline / Terms */}
            <div className="max-w-xl text-white/90">
              <h3 className="mb-4 font-mono text-sm uppercase tracking-widest text-white/70">
                {t("leadership.termHistory")}
              </h3>

              <div className="flex flex-col gap-4">
                {activeLeader.roles.map((role) => {
                  const startYear = new Date(role.startAt).getFullYear();
                  const endYear = role.endAt
                    ? new Date(role.endAt).getFullYear()
                    : t("leadership.present");

                  return (
                    <div
                      className="flex items-start gap-4 border-white/20 border-l pl-4"
                      key={role.id}
                    >
                      <div className="-ml-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-black" />
                      <div>
                        <div className="font-bold text-base text-white">
                          {(t as any)(
                            `leadership.positions.${role.position}`,
                          ) || role.position}
                        </div>
                        <div className="font-mono text-xs text-white/70 tracking-tight">
                          {role.departmentName
                            ? `${role.departmentName} // `
                            : ""}
                          {startYear} - {endYear}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <Button
                asChild
                className="rounded-none border-primary bg-primary/10 px-8 py-6 text-primary hover:bg-primary hover:text-primary-foreground font-mono transition-all duration-300 backdrop-blur-sm"
                variant="outline"
              >
                <Link href={`/members/${activeLeader.member.slug}`}>
                  <CircleDot className="mr-2 h-4 w-4" />{" "}
                  {t("leadership.viewProfile")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Slider Area */}
        {leaders.length > 1 && (
          <div className="mt-8 flex w-full items-center gap-4">
            <Button
              className="hidden md:flex h-10 w-10 shrink-0 rounded-full border border-white/20 bg-black/50 text-white/70 hover:bg-white/20 hover:text-white"
              onClick={prev}
              size="icon"
              variant="outline"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div
              ref={scrollContainerRef}
              className="flex w-full min-w-0 flex-1 items-center gap-3 overflow-x-auto pb-4 scrollbar-hide md:pb-0 touch-pan-x"
              onWheel={(e) => {
                e.currentTarget.scrollLeft += e.deltaY;
              }}
            >
              {leaders.map((leader, i) => {
                const isActive = i === currentIndex;
                return (
                  <button
                    aria-label={`Select ${leader.member.firstName}`}
                    className={`relative shrink-0 flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-300 sm:h-14 sm:w-14 ${
                      isActive
                        ? "scale-100 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                        : "scale-90 border-white/20 opacity-50 hover:scale-100 hover:opacity-100"
                    }`}
                    key={leader.member.id}
                    onClick={() => setCurrentIndex(i)}
                  >
                    {leader.member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={leader.member.firstName}
                        className="h-full w-full object-cover"
                        src={leader.member.avatar}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted font-bold text-foreground">
                        {leader.member.firstName[0]}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <Button
              className="hidden md:flex h-10 w-10 shrink-0 rounded-full border border-white/20 bg-black/50 text-white/70 hover:bg-white/20 hover:text-white"
              onClick={next}
              size="icon"
              variant="outline"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Animated Timeline Bar */}
      <div className="absolute bottom-0 left-0 z-20 h-1 w-full bg-white/20">
        <div
          className="h-full origin-left bg-primary"
          key={`progress-${currentIndex}`}
          style={{ animation: "progress 8s linear" }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes progress {
              0% { transform: scaleX(0); }
              100% { transform: scaleX(1); }
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `,
        }}
      />
    </section>
  );
}
