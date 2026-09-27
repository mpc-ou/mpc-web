import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getLeadership } from "@/app/_actions/main";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";
import type { ClubPosition } from "@/configs/prisma/generated/prisma/client";
import { buildSocialHref, cn, getFullName } from "@/lib/utils";
import { getSocialMeta, parseSocials } from "@/utils/social";

const POSITION_ORDER = ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"] as const;
const WHITESPACE_RE = /\s+/;
const MAX_SOCIALS = 4;

type ClubRole = {
  position: ClubPosition;
  department: { nameVi: string; slug: string } | null;
};

type LeaderWithRoles = {
  id: string;
  slug: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  socials: unknown;
  clubRoles: ClubRole[];
};

const getTopRole = (roles: ClubRole[], positionLabel: Record<string, string>) => {
  const top = [...roles].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.position as (typeof POSITION_ORDER)[number]) -
      POSITION_ORDER.indexOf(b.position as (typeof POSITION_ORDER)[number])
  )[0];
  if (!top) {
    return "";
  }
  const label = positionLabel[top.position] ?? top.position;
  return top.department ? `${label} ${top.department.nameVi}` : label;
};

const isPresident = (member: LeaderWithRoles) => member.clubRoles.some((r) => r.position === "PRESIDENT");

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(WHITESPACE_RE)
    .slice(-2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

const profileHref = (member: LeaderWithRoles) => `/members/${member.slug ?? member.id}` as "/";

type PodiumSlot = { member: LeaderWithRoles; rank: string; isCenter: boolean };

const arrangePodium = (executives: LeaderWithRoles[]): PodiumSlot[] => {
  const centerIdx = Math.max(executives.findIndex(isPresident), 0);
  const center = executives[centerIdx];
  if (!center) {
    return [];
  }
  const others = executives.filter((_, i) => i !== centerIdx);
  const left = others.filter((_, i) => i % 2 === 0).reverse();
  const right = others.filter((_, i) => i % 2 === 1);
  const toSlot = (member: LeaderWithRoles, isCenter: boolean): PodiumSlot => ({
    member,
    rank: isPresident(member) ? "01" : "02",
    isCenter
  });
  return [...left.map((m) => toSlot(m, false)), toSlot(center, true), ...right.map((m) => toSlot(m, false))];
};

const SocialLinks = ({ socials, className }: { socials: unknown; className?: string }) => {
  const list = parseSocials(socials).slice(0, MAX_SOCIALS);
  if (list.length === 0) {
    return null;
  }
  return (
    <div className={cn("relative z-10 flex gap-1.5", className)}>
      {list.map((social) => {
        const meta = getSocialMeta(social.platform);
        return (
          <a
            aria-label={meta.platform}
            className='flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110 dark:bg-white/85'
            href={buildSocialHref(social.url, meta.prefix)}
            key={social.id || `${social.platform}-${social.url}`}
            rel='noopener noreferrer'
            target='_blank'
            title={meta.platform}
          >
            <Image alt='' className='h-4 w-4 object-contain' height={16} src={meta.icon} width={16} />
          </a>
        );
      })}
    </div>
  );
};

const Pedestal = ({ isCenter }: { rank: string; isCenter: boolean }) => (
  <div aria-hidden className='relative -mt-2 transition-[filter] duration-300 group-hover:brightness-110 sm:-mt-3'>
    <div
      className={cn(
        "transform-[perspective(160px)_rotateX(60deg)] h-4 origin-bottom rounded-t-md sm:h-6",
        isCenter ? "bg-linear-to-b from-primary/60 to-primary" : "bg-linear-to-b from-muted to-border"
      )}
    />
    <div
      className={cn(
        "flex items-center justify-center rounded-b-lg border-x border-b font-black font-mono shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
        isCenter
          ? "h-8 border-primary/50 bg-linear-to-b from-primary to-primary/80 sm:h-11"
          : "h-5 border-border bg-linear-to-b from-border to-muted sm:h-7"
      )}
    >
      {/* <span className={isCenter ? "text-xl sm:text-3xl" : "text-sm sm:text-xl"}>{Number(rank)}</span> */}
    </div>
    <div
      className={cn(
        "mx-auto mt-1 h-2 w-[85%] rounded-full blur-md",
        isCenter ? "bg-primary/50" : "bg-black/30 dark:bg-black/50"
      )}
    />
  </div>
);

type PodiumCardProps = {
  slot: PodiumSlot;
  locale: string;
  positionLabel: Record<string, string>;
};

const PodiumCard = ({ slot, locale, positionLabel }: PodiumCardProps) => {
  const { member, rank, isCenter } = slot;
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const topRole = getTopRole(member.clubRoles, positionLabel);

  return (
    <div
      className={cn(
        "group flex min-w-0 flex-col sm:flex-none",
        isCenter ? "max-w-52 flex-[1.3] sm:w-48 lg:w-52" : "max-w-44 flex-1 sm:w-40 lg:w-44"
      )}
    >
      <div
        className={cn(
          "relative z-10 aspect-square overflow-hidden rounded-xl border bg-muted transition-all duration-300 group-hover:-translate-y-1.5 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary sm:rounded-2xl",
          isCenter
            ? "border-2 border-primary shadow-[0_0_36px_-10px_hsl(var(--primary)/0.6)] group-hover:shadow-[0_0_56px_-6px_hsl(var(--primary)/0.85)]"
            : "border-border group-hover:border-primary/70 group-hover:shadow-[0_0_32px_-12px_hsl(var(--primary)/0.7)]"
        )}
      >
        {member.avatar ? (
          <Image
            alt=''
            className='object-cover transition-transform duration-500 group-hover:scale-110'
            fill
            sizes='(min-width: 1024px) 208px, (min-width: 640px) 192px, 40vw'
            src={member.avatar}
          />
        ) : (
          <span className='absolute inset-0 flex items-center justify-center font-bold text-2xl text-muted-foreground sm:text-4xl'>
            {getInitials(fullName)}
          </span>
        )}
        <div className='absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent' />
        <div className='absolute inset-0 bg-linear-to-t from-primary/45 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        <Link aria-label={fullName} className='absolute inset-0 outline-none' href={profileHref(member)} />
        <SocialLinks
          className='absolute top-2.5 left-2.5 hidden opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover:opacity-100 sm:flex'
          socials={member.socials}
        />
        <div className='absolute inset-x-0 bottom-0 p-2 text-left sm:p-3.5'>
          <p
            className={cn(
              "line-clamp-2 font-bold text-white leading-tight",
              isCenter ? "text-sm sm:text-lg" : "text-xs sm:text-base"
            )}
          >
            {fullName}
          </p>
          <p className={cn("mt-0.5 line-clamp-1 text-[10px] sm:text-xs", isCenter ? "text-primary" : "text-white/70")}>
            {topRole}
          </p>
        </div>
      </div>
      <Pedestal isCenter={isCenter} rank={rank} />
    </div>
  );
};

const StaffCard = ({ member, locale, topRole }: { member: LeaderWithRoles; locale: string; topRole: string }) => {
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);

  return (
    <div className='group relative aspect-3/4 w-[calc((100%-1.25rem)/3)] overflow-hidden rounded-xl border border-border bg-muted transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/70 hover:shadow-[0_0_32px_-12px_hsl(var(--primary)/0.7)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary sm:w-36 sm:rounded-2xl lg:w-40'>
      {member.avatar ? (
        <Image
          alt=''
          className='object-cover transition-transform duration-500 group-hover:scale-110'
          fill
          sizes='(min-width: 1024px) 160px, (min-width: 640px) 144px, 33vw'
          src={member.avatar}
        />
      ) : (
        <span className='absolute inset-0 flex items-center justify-center font-bold text-3xl text-muted-foreground'>
          {getInitials(fullName)}
        </span>
      )}
      <div className='absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent' />
      <div className='absolute inset-0 bg-linear-to-t from-primary/45 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      <Link aria-label={fullName} className='absolute inset-0 outline-none' href={profileHref(member)} />
      <SocialLinks
        className='pointer-events-none absolute top-2.5 left-2.5 flex-wrap opacity-0 transition-all duration-300 focus-within:translate-y-0 focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 sm:-translate-y-1 [&_a]:h-6 [&_a]:w-6'
        socials={member.socials}
      />
      <div className='pointer-events-none absolute inset-x-0 bottom-0 p-2 text-left sm:p-3'>
        <p className='line-clamp-2 font-bold text-white text-xs leading-tight transition-colors group-hover:text-primary-foreground sm:text-sm'>
          {fullName}
        </p>
        <p className='mt-0.5 line-clamp-2 text-[9px] text-white/70 sm:text-[11px]'>{topRole}</p>
      </div>
    </div>
  );
};

const ManagementSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.team" });
  const tPos = await getTranslations({
    locale,
    namespace: "userMenu.positions"
  });
  const positionLabel: Record<string, string> = {
    PRESIDENT: tPos("PRESIDENT"),
    VICE_PRESIDENT: tPos("VICE_PRESIDENT"),
    DEPARTMENT_LEADER: tPos("DEPARTMENT_LEADER"),
    DEPARTMENT_VICE_LEADER: tPos("DEPARTMENT_VICE_LEADER")
  };
  const { data } = await getLeadership();

  const leaders = (data?.payload ?? []) as LeaderWithRoles[];

  const executives = leaders.filter((m) =>
    m.clubRoles.some((r) => r.position === "PRESIDENT" || r.position === "VICE_PRESIDENT")
  );
  const departmentHeads = leaders.filter((m) =>
    m.clubRoles.every((r) => r.position !== "PRESIDENT" && r.position !== "VICE_PRESIDENT")
  );
  const podium = arrangePodium(executives);

  return (
    <section className='relative w-full overflow-hidden bg-background py-20 sm:py-24' suppressHydrationWarning>
      <div className='container relative mx-auto px-4'>
        <ScrollReveal>
          <SectionHeading description={t("subtitle")} tag='organization' title={t("title")} />
        </ScrollReveal>

        {leaders.length === 0 ? (
          <p className='text-center text-muted-foreground'>{t("noLeadership")}</p>
        ) : (
          <div className='flex flex-col gap-10'>
            {podium.length > 0 && (
              <ScrollReveal>
                <h3 className='sr-only'>{t("president")}</h3>
                <div className='flex items-end justify-center gap-2.5 sm:gap-5 lg:gap-7'>
                  {podium.map((slot) => (
                    <PodiumCard key={slot.member.id} locale={locale} positionLabel={positionLabel} slot={slot} />
                  ))}
                </div>
              </ScrollReveal>
            )}

            {departmentHeads.length > 0 && (
              <ScrollReveal>
                <div className='mb-6 flex items-center gap-4'>
                  <span className='h-px flex-1 bg-border' />
                  <h3 className='font-mono text-muted-foreground text-xs uppercase tracking-[0.3em]'>{t("staff")}</h3>
                  <span className='h-px flex-1 bg-border' />
                </div>
                <div className='flex flex-wrap justify-center gap-2.5 sm:gap-4'>
                  {departmentHeads.map((member) => (
                    <StaffCard
                      key={member.id}
                      locale={locale}
                      member={member}
                      topRole={getTopRole(member.clubRoles, positionLabel)}
                    />
                  ))}
                </div>
              </ScrollReveal>
            )}

            <div className='text-center'>
              <Link className='font-semibold text-base text-primary underline-offset-4 hover:underline' href='/members'>
                {t("viewAll")}

                <ChevronRight className='ml-2 inline h-4 w-4' />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { ManagementSection };
