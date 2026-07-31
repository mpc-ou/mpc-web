"use client";

import { useLocale, useTranslations } from "next-intl";
import { MemberHoverCard } from "@/components/custom/member-hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  avatar: string | null;
  socials?: { platform: string; url: string }[] | null;
  currentRole: {
    position: string;
    department?: { nameVi?: string | null } | null;
  } | null;
};

export function MembersClient({ groupMembers }: { groupMembers: Member[] }) {
  const locale = useLocale();
  const tPos = useTranslations("userMenu.positions");
  const t = useTranslations("membersPage");
  return (
    <div className='flex flex-wrap gap-4'>
      {groupMembers.map((member, idx) => {
        const initials = `${member.firstName[0]}${member.lastName[0]}`;
        const role = member.currentRole;
        const positionLabel = role ? tPos(role.position as string) || role.position : "Thành viên";
        const departmentName = role?.department?.nameVi || "Ban Điều Hành";

        return (
          <ScrollReveal delay={(idx % 12) * 40} key={member.id} variant='zoom-in'>
            <MemberHoverCard
              badgeText={positionLabel}
              locale={locale}
              member={{ ...member, socials: member.socials ?? [] }}
              subtitle={departmentName}
              viewProfileLabel={t("viewDetail")}
            >
              <Link href={`/members/${member.slug}`}>
                <Avatar className='h-20 w-20 cursor-pointer border-4 border-background bg-muted shadow-sm transition-transform duration-300 hover:scale-105 hover:border-primary/50 md:h-24 md:w-24'>
                  {member.avatar && <AvatarImage src={member.avatar} />}
                  <AvatarFallback className='font-bold text-lg'>{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </MemberHoverCard>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
