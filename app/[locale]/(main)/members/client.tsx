"use client";

import { useLocale, useTranslations } from "next-intl";
import { MemberHoverCard } from "@/components/custom/member-hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/configs/i18n/routing";
import { cn, getFullName } from "@/lib/utils";

export function MembersClient({ groupMembers }: { groupMembers: any[] }) {
  const locale = useLocale();
  const tPos = useTranslations("userMenu.positions");
  const t = useTranslations("membersPage");
  return (
    <div className="flex flex-wrap gap-4">
      {groupMembers.map((member) => {
        const initials = `${member.firstName[0]}${member.lastName[0]}`;
        const role = member.currentRole;
        const positionLabel = role
          ? tPos(role.position as any) || role.position
          : "Thành viên";
        const departmentName = role?.department?.nameVi || "Ban Điều Hành";

        return (
          <MemberHoverCard
            badgeText={positionLabel}
            key={member.id}
            locale={locale}
            member={member}
            subtitle={departmentName}
            viewProfileLabel={t("viewDetail")}
          >
            <Link href={`/members/${member.slug}`}>
              <Avatar className="h-20 w-20 cursor-pointer border-4 border-background bg-muted shadow-sm transition-transform duration-300 hover:scale-105 hover:border-primary/50 md:h-24 md:w-24">
                {member.avatar && <AvatarImage src={member.avatar} />}
                <AvatarFallback className="font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </MemberHoverCard>
        );
      })}
    </div>
  );
}
