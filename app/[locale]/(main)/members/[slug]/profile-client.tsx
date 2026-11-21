"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { getActiveBadges } from "@/components/custom/badge-icon";
import { CoverParallax } from "@/components/custom/cover-parallax";
import { SpotifyPlayer } from "@/components/custom/spotify-player";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import type { BadgeData } from "@/configs/badges";
import { getFullName } from "@/lib/utils";
import { buildTimeline, type Member, pickFeatured } from "./_components/profile-data";
import { ProfileHeader } from "./_components/profile-header";
import { FeaturedGrid, ProfileTimeline } from "./_components/profile-timeline";

export type { Member } from "./_components/profile-data";

export function ProfilePageClient({ member }: { member: Member }) {
  const locale = useLocale();
  const tm = useTranslations("header.member");
  const tPos = useTranslations("userMenu.positions");
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const initials = `${member.firstName[0]}${member.lastName[0]}`;

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

  const timeline = useMemo(
    () =>
      buildTimeline(member, locale, {
        position: (position) => tPos(position as Parameters<typeof tPos>[0]) || position,
        term: (term) => tm("term", { term }),
        readMinutes: (count) => tm("readMinutes", { count }),
        joinedClub: tm("joinedClub")
      }),
    [member, locale, tPos, tm]
  );
  const featured = useMemo(() => pickFeatured(timeline), [timeline]);

  return (
    <div className='min-h-screen bg-background pb-20'>
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
        <ProfileHeader
          activeBadges={activeBadges}
          activeRole={activeRole}
          fullName={fullName}
          hasLeftClub={hasLeftClub}
          initials={initials}
          isGuest={isGuest}
          member={member}
        />
      </ScrollReveal>

      <div className='mx-auto max-w-6xl px-4'>
        <div className='mt-8 border-border border-t' />
        <FeaturedGrid items={featured} />
        <ProfileTimeline items={timeline} />
      </div>
    </div>
  );
}
