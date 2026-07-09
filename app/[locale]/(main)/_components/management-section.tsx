import { getTranslations } from "next-intl/server";
import { getLeadership } from "@/app/_actions/main";
import { MemberHoverCard } from "@/components/custom/member-hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";
import { type ClubPosition } from "@/configs/prisma/generated/prisma/client";
import { getFullName } from "@/lib/utils";

const POSITION_ORDER = ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"] as const;

type LeaderWithRoles = {
  id: string;
  slug: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  avatar: string | null;
  bio: string | null;
  socials: unknown;
  clubRoles: {
    position: ClubPosition;
    department: { nameVi: string; slug: string } | null;
  }[];
};

const getTopRole = (
  roles: {
    position: ClubPosition;
    department: { nameVi: string; slug: string } | null;
  }[],
  positionLabel: Record<string, string>
) => {
  const sorted = [...roles].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.position as (typeof POSITION_ORDER)[number]) -
      POSITION_ORDER.indexOf(b.position as (typeof POSITION_ORDER)[number])
  );
  const top = sorted[0];
  if (!top) {
    return "";
  }
  const label = positionLabel[top.position] ?? top.position;
  return top.department ? `${label} – ${top.department.nameVi}` : label;
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

  return (
    <section className='w-full bg-background py-20' suppressHydrationWarning>
      <div className='container mx-auto px-4'>
        <ScrollReveal className='mb-12 text-center'>
          <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
            &gt; organization
          </span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t("title")}</h2>
          <p className='mt-3 text-muted-foreground'>{t("subtitle")}</p>
        </ScrollReveal>

        {leaders.length === 0 ? (
          <p className='text-center text-muted-foreground'>{t("noLeadership")}</p>
        ) : (
          <div className='flex flex-col gap-12'>
            {/* Executive Board */}
            {executives.length > 0 && (
              <div>
                <h3 className='mb-6 text-center font-semibold text-foreground text-xl'>{t("president")}</h3>
                <div className='flex flex-wrap justify-center gap-6'>
                  {executives.map((member) => {
                    const topRole = getTopRole(member.clubRoles, positionLabel);
                    return (
                      <MemberHoverCard
                        badgeText={topRole}
                        key={member.id}
                        locale={locale}
                        member={member}
                        subtitle={t("executiveDept")}
                        viewProfileLabel={t("viewProfile")}
                      >
                        <div className='flex h-full w-52 flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center shadow-sm transition-shadow hover:shadow-md'>
                          <Avatar className='h-20 w-20 ring-2 ring-primary/20 transition-transform duration-300 group-hover:scale-105 group-hover:ring-primary/50'>
                            <AvatarImage src={member.avatar ?? undefined} />
                            <AvatarFallback className='bg-primary/10 font-bold text-lg text-primary'>
                              {getFullName(member.firstName, member.middleName, member.lastName, locale)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='font-semibold text-foreground'>
                              {getFullName(member.firstName, member.middleName, member.lastName, locale)}
                            </p>
                            <p className='mt-0.5 font-medium text-muted-foreground text-xs'>{topRole}</p>
                            {member.bio && (
                              <p className='mt-2 line-clamp-2 text-muted-foreground text-xs leading-relaxed'>
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </MemberHoverCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Department Leaders */}
            {departmentHeads.length > 0 && (
              <div>
                <h3 className='mb-6 text-center font-semibold text-foreground text-xl'>{t("staff")}</h3>
                <div className='flex flex-wrap justify-center gap-4'>
                  {departmentHeads.map((member) => {
                    const topRole = getTopRole(member.clubRoles, positionLabel);
                    const topDept =
                      member.clubRoles.find((r) => ["DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"].includes(r.position))
                        ?.department?.nameVi || t("departmentMember");

                    return (
                      <MemberHoverCard
                        badgeText={topRole}
                        key={member.id}
                        locale={locale}
                        member={member}
                        subtitle={topDept}
                        viewProfileLabel={t("viewProfile")}
                      >
                        <div className='flex h-full w-44 flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center shadow-sm transition-shadow hover:shadow-md'>
                          <Avatar className='h-14 w-14 ring-2 ring-border transition-transform duration-300 group-hover:scale-105 group-hover:ring-primary/50'>
                            <AvatarImage src={member.avatar ?? undefined} />
                            <AvatarFallback className='bg-muted font-bold text-foreground text-sm'>
                              {getFullName(member.firstName, member.middleName, member.lastName, locale)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='font-semibold text-foreground text-sm'>
                              {getFullName(member.firstName, member.middleName, member.lastName, locale)}
                            </p>
                            <p className='mt-0.5 text-muted-foreground text-xs'>{topRole}</p>
                          </div>
                        </div>
                      </MemberHoverCard>
                    );
                  })}
                </div>
              </div>
            )}

            <div className='text-center'>
              <Link className='font-medium text-primary text-sm underline-offset-4 hover:underline' href='/members'>
                {t("viewAll")} →
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { ManagementSection };
