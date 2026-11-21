import { AlertTriangle, BadgeCheck, DoorOpen, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { BadgeIcon, type getActiveBadges } from "@/components/custom/badge-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SOCIAL_COLLECTION } from "@/constants/common";
import { buildSocialHref, cn } from "@/lib/utils";
import { getSocialMeta, parseSocials } from "@/utils/social";
import { departmentName, type Member } from "./profile-data";

type ProfileHeaderProps = {
  member: Member;
  fullName: string;
  initials: string;
  activeRole: Member["clubRoles"][number] | undefined;
  isGuest: boolean;
  hasLeftClub: boolean;
  activeBadges: ReturnType<typeof getActiveBadges>;
};

const pillClass =
  "group/pill inline-flex h-9 items-center rounded-lg border px-2.5 font-mono font-semibold text-xs lowercase transition-colors";

const PillLabel = ({ children }: { children: React.ReactNode }) => (
  <span className='max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/pill:ml-1.5 group-hover/pill:max-w-40 group-hover/pill:opacity-100 group-focus-visible/pill:ml-1.5 group-focus-visible/pill:max-w-40 group-focus-visible/pill:opacity-100'>
    {children}
  </span>
);

function ContactLinks({ member }: { member: Member }) {
  const allSocials = parseSocials(member.socials);
  const isMail = (platform: string) => getSocialMeta(platform) === SOCIAL_COLLECTION.EMAIL;
  const socials = allSocials.filter((s) => !isMail(s.platform));
  const mailSocial = allSocials.find((s) => isMail(s.platform));
  let mailHref: string | null = null;
  if (member.email) {
    mailHref = `mailto:${member.email}`;
  } else if (mailSocial) {
    mailHref = buildSocialHref(mailSocial.url, SOCIAL_COLLECTION.EMAIL.prefix);
  }

  return (
    <div className='flex flex-wrap gap-2 md:justify-end md:self-end'>
      {socials.map((social) => {
        const meta = getSocialMeta(social.platform);
        return (
          <a
            aria-label={meta.platform}
            className={cn(pillClass, "border-border bg-card hover:border-primary/60 hover:text-primary")}
            href={buildSocialHref(social.url, meta.prefix)}
            key={social.id || `${social.platform}-${social.url}`}
            rel='noopener noreferrer'
            target='_blank'
          >
            <Image alt='' className='h-4 w-4 object-contain' height={16} src={meta.icon} width={16} />
            <PillLabel>{meta.platform}</PillLabel>
          </a>
        );
      })}
      {member.phone && member.showPhone && (
        <a
          aria-label={member.phone}
          className={cn(pillClass, "border-border bg-card hover:border-primary/60 hover:text-primary")}
          href={`tel:${member.phone}`}
        >
          <Phone className='h-4 w-4' />
          <PillLabel>{member.phone}</PillLabel>
        </a>
      )}
      {mailHref && (
        <a
          aria-label='mail'
          className={cn(pillClass, "border-primary bg-primary text-white hover:bg-primary/90")}
          href={mailHref}
        >
          <Mail className='h-4 w-4' />
          <PillLabel>mail</PillLabel>
        </a>
      )}
    </div>
  );
}

export function ProfileHeader({
  member,
  fullName,
  initials,
  activeRole,
  isGuest,
  hasLeftClub,
  activeBadges
}: ProfileHeaderProps) {
  const tm = useTranslations("header.member");
  const tPos = useTranslations("userMenu.positions");
  const locale = useLocale();
  const handle = [member.slug && `@${member.slug}`, member.showStudentId && member.studentId && `#${member.studentId}`]
    .filter(Boolean)
    .join(" · ");
  const sinceYear = activeRole ? new Date(activeRole.startAt).getFullYear() : null;

  return (
    <div className='mx-auto max-w-6xl px-4'>
      <div className='relative -mt-14 flex flex-col gap-5 md:-mt-16 md:flex-row md:items-end'>
        <div className='shrink-0 self-start rounded-2xl border-2 border-primary bg-background p-1 shadow-[0_0_40px_-12px_rgba(249,115,22,0.7)] md:self-auto'>
          <Avatar className='h-28 w-28 rounded-xl md:h-36 md:w-36'>
            <AvatarImage className='object-cover' src={member.avatar ?? undefined} />
            <AvatarFallback className='rounded-xl bg-primary/10 font-bold text-4xl text-primary'>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-2'>
          {handle && <p className='font-mono text-muted-foreground text-xs'>{handle}</p>}
          <h1 className='font-extrabold text-3xl text-foreground tracking-tight md:text-5xl'>
            {fullName}
            {isGuest && (
              <span title={tm("guestNotice")}>
                <AlertTriangle className='ml-2 inline-block h-5 w-5 align-middle text-amber-500' />
              </span>
            )}
            {!(isGuest || hasLeftClub) && (
              <span title={tm("activeMember")}>
                <BadgeCheck className='ml-2 inline-block h-5 w-5 align-middle text-green-500' />
              </span>
            )}
            {hasLeftClub && (
              <span title={tm("leftClub")}>
                <DoorOpen className='ml-2 inline-block h-5 w-5 align-middle text-muted-foreground' />
              </span>
            )}
          </h1>

          <div className='flex flex-wrap items-center gap-2 text-muted-foreground text-sm'>
            {activeRole && (
              <span className='rounded bg-primary px-2 py-0.5 font-bold font-mono text-[11px] text-white uppercase'>
                {tPos(activeRole.position as Parameters<typeof tPos>[0]) || activeRole.position}
              </span>
            )}
            {activeRole && (
              <span>
                {[
                  activeRole.department && departmentName(activeRole.department, locale),
                  sinceYear && tm("since", { year: sinceYear })
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
            {hasLeftClub && (
              <span className='rounded border px-2 py-0.5 font-mono text-[11px] uppercase'>{tm("leftClub")}</span>
            )}
            {isGuest && (
              <span className='rounded border px-2 py-0.5 font-mono text-[11px] uppercase'>{tm("guest")}</span>
            )}
          </div>

          {!isGuest && activeBadges.length > 0 && (
            <div className='flex flex-wrap items-center gap-2 pt-1'>
              {activeBadges.map(({ def, result }) => (
                <BadgeIcon def={def} key={def.id} result={result} />
              ))}
            </div>
          )}
        </div>

        <ContactLinks member={member} />
      </div>

      {member.bio && <p className='mt-5 max-w-3xl text-muted-foreground text-sm leading-relaxed'>{member.bio}</p>}

      {isGuest && (
        <div className='mt-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-amber-600 text-xs'>
          <AlertTriangle className='h-4 w-4 shrink-0' />
          <span>{tm("guestNotice")}</span>
        </div>
      )}
      {hasLeftClub && (
        <div className='mt-4 flex items-center gap-2 rounded-lg border border-muted-foreground/20 bg-muted/30 px-3 py-2 text-muted-foreground text-xs'>
          <DoorOpen className='h-4 w-4 shrink-0' />
          <span>{tm("leftClubNotice")}</span>
        </div>
      )}
    </div>
  );
}
