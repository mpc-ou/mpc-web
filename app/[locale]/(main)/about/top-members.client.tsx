"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

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

export function TopMembersCarouselClient({
  members,
  locale,
}: {
  members: any[];
  locale: string;
}) {
  const [emblaRef] = useEmblaCarousel(
    { dragFree: true, loop: true, align: "start" },
    [AutoScroll({ playOnInit: true, speed: 1.5 })],
  );

  return (
    <div className="" ref={emblaRef}>
      <div className="flex touch-pan-y pt-4 pb-8">
        {members.map((member) => {
          const fullName = getFullName(
            member.firstName,
            member.lastName,
            locale,
          );
          const initials = `${member.firstName[0]}${member.lastName[0]}`;
          const role = member.currentRole;
          const positionLabel = role
            ? POSITION_LABELS[role.position] || role.position
            : "Thành viên";
          const departmentName = role?.department?.nameVi || "Ban Điều Hành";
          const socials = Array.isArray(member.socials) ? member.socials : [];

          return (
            <div className="min-w-0 flex-[0_0_auto] px-4" key={member.id}>
              <div className="group relative">
                {/* Avatar */}
                <Link href={`/members/${member.slug}`}>
                  <Avatar className="h-24 w-24 cursor-pointer border-4 border-background bg-muted shadow-lg transition-transform duration-300 hover:scale-105 hover:border-primary/50 md:h-28 md:w-28">
                    {member.avatar && <AvatarImage src={member.avatar} />}
                    <AvatarFallback className="font-bold text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-primary px-2 font-bold text-[10px] text-primary-foreground shadow-xs">
                  {member.achievementCount}{" "}
                  <span className="ml-1 text-[8px]">🏆</span>
                </div>

                {/* Hover Card */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 ml-0 -translate-x-1/2 opacity-0 shadow-2xl transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                  {/* Invisible bridge to maintain hover state */}
                  <div className="absolute inset-x-0 -bottom-4 h-4 bg-transparent" />

                  <div className="w-64 rounded-xl border border-border bg-card p-4 text-card-foreground">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Avatar className="h-16 w-16 border-2 border-background shadow-xs">
                        {member.avatar && <AvatarImage src={member.avatar} />}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-bold">{fullName}</h3>
                        <p className="text-muted-foreground text-xs">
                          {departmentName}
                        </p>
                      </div>

                      <Badge className="mb-2" variant="secondary">
                        {positionLabel}
                      </Badge>

                      {/* Social Links Mini */}
                      {socials.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1.5 pb-2">
                          {socials.slice(0, 4).map((social: any) => {
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
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs transition-colors hover:bg-primary/20"
                                href={href}
                                key={social.id || social.platform}
                                rel="noopener noreferrer"
                                target="_blank"
                                title={meta.platform}
                              >
                                <img
                                  alt={meta.platform}
                                  className="h-3.5 w-3.5 object-contain"
                                  src={meta.icon}
                                />
                              </a>
                            );
                          })}
                        </div>
                      )}

                      <Button asChild className="h-8 w-full text-xs" size="sm">
                        <Link href={`/members/${member.slug}`}>
                          Xem chi tiết
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Tooltip Arrow */}
                  <div className="absolute -bottom-2 left-1/2 ml-0 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm border-border border-r border-b bg-card" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
