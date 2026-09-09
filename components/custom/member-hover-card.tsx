"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";
import { SOCIAL_COLLECTION } from "@/constants/common";
import { buildSocialHref, cn, getFullName } from "@/lib/utils";

type SocialEntry = { id?: string; platform: string; url: string };

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

export type HoverCardMember = {
  id: string;
  slug: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  avatar: string | null;
  socials: SocialEntry[] | unknown;
};

type MemberHoverCardProps = {
  member: HoverCardMember;
  locale: string;
  /** Department / subgroup name shown under the name */
  subtitle: string;
  /** Badge text (e.g. position label) */
  badgeText: string;
  /** "View Profile" link text */
  viewProfileLabel: string;
  /** Optional class for the trigger area */
  className?: string;
  children: React.ReactNode;
};

export function MemberHoverCard({
  member,
  locale,
  subtitle,
  badgeText,
  viewProfileLabel,
  className,
  children
}: MemberHoverCardProps) {
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const initials = `${member.firstName[0]}${member.lastName[0]}`;
  const parsedSocials = (Array.isArray(member.socials) ? member.socials : []) as SocialEntry[];

  return (
    <div className={cn("group relative", className)}>
      {children}

      <div className='pointer-events-none absolute bottom-[105%] left-1/2 z-100 mb-3 -translate-x-1/2 opacity-0 shadow-xl transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100'>
        <div className='absolute inset-x-0 -bottom-8 h-12 bg-transparent' />

        <div className='w-64 rounded-xl border border-border bg-card p-4 text-card-foreground'>
          <div className='flex flex-col items-center gap-2 text-center'>
            <Avatar className='h-16 w-16 border-2 border-background shadow-xs'>
              {member.avatar && <AvatarImage src={member.avatar} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div>
              <h3 className='font-bold'>{fullName}</h3>
              <p className='text-muted-foreground text-xs'>{subtitle}</p>
            </div>

            <Badge className='mb-2' variant='secondary'>
              {badgeText}
            </Badge>

            {parsedSocials.length > 0 && (
              <div className='flex flex-wrap justify-center gap-1.5 pb-2'>
                {parsedSocials.slice(0, 4).map((social) => {
                  if (!social.url) {
                    return null;
                  }
                  const meta = getSocialMeta(social.platform);
                  const href = buildSocialHref(social.url, meta.prefix);
                  return (
                    <a
                      className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs transition-colors hover:bg-primary/20'
                      href={href}
                      key={social.id || social.platform}
                      rel='noopener noreferrer'
                      target='_blank'
                      title={social.platform}
                    >
                      <Image
                        alt={meta.platform}
                        className='h-4 w-4 object-contain'
                        height={64}
                        src={meta.icon}
                        width={64}
                      />
                    </a>
                  );
                })}
              </div>
            )}

            <Button asChild className='h-8 w-full text-xs' size='sm'>
              <Link href={member.slug ? `/members/${member.slug}` : "#"}>{viewProfileLabel}</Link>
            </Button>
          </div>
        </div>

        {/* Tooltip Arrow */}
        <div className='absolute -bottom-2 left-1/2 ml-0 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm border-border border-r border-b bg-card' />
      </div>
    </div>
  );
}
