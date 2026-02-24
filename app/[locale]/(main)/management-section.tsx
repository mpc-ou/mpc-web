import { Facebook, Github, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getLeadership } from "@/app/[locale]/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/configs/i18n/routing";
import { type ClubPosition } from "@/configs/prisma/generated/prisma/client";

const positionLabel: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm CLB",
  VICE_PRESIDENT: "Phó Chủ nhiệm CLB",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban"
};

import { SOCIAL_COLLECTION } from "@/constants/common";

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

type SocialLinks = {
  facebook?: string;
  github?: string;
  email?: string;
};

const ManagementSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.team" });
  const { data, error } = await getLeadership();

  type LeaderWithRoles = {
    id: string;
    slug: string | null;
    firstName: string;
    lastName: string;
    avatar: string | null;
    bio: string | null;
    socials: unknown;
    clubRoles: {
      position: ClubPosition;
      department: { name: string } | null;
    }[];
  };

  const leaders = (data?.payload ?? []) as LeaderWithRoles[];

  const executives = leaders.filter((m) =>
    m.clubRoles.some((r) => r.position === "PRESIDENT" || r.position === "VICE_PRESIDENT")
  );
  const departmentHeads = leaders.filter((m) =>
    m.clubRoles.every((r) => r.position !== "PRESIDENT" && r.position !== "VICE_PRESIDENT")
  );

  const getTopRole = (roles: { position: ClubPosition; department: { name: string } | null }[]) => {
    const sorted = [...roles].sort((a, b) => {
      const order = ["PRESIDENT", "VICE_PRESIDENT", "DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"];
      return order.indexOf(a.position) - order.indexOf(b.position);
    });
    const top = sorted[0];
    if (!top) {
      return "";
    }
    const label = positionLabel[top.position] ?? top.position;
    return top.department ? `${label} – ${top.department.name}` : label;
  };

  return (
    <section className='w-full bg-background py-20'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <span className='rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm'>Tổ chức</span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t("title")}</h2>
          <p className='mt-3 text-muted-foreground'>{t("subtitle")}</p>
        </div>

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
                    const parsedSocials = Array.isArray(member.socials) ? member.socials : [];
                    const topRole = getTopRole(member.clubRoles);
                    const isPresident = member.clubRoles.some((r) => r.position === "PRESIDENT");

                    return (
                      <div className='group relative' key={member.id}>
                        {/* Member Card */}
                        <div className='flex h-full w-52 flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center shadow-sm transition-shadow hover:shadow-md'>
                          <Avatar className='h-20 w-20 ring-2 ring-primary/20 transition-transform duration-300 group-hover:scale-105 group-hover:ring-primary/50'>
                            <AvatarImage src={member.avatar ?? undefined} />
                            <AvatarFallback className='bg-primary/10 font-bold text-lg text-primary'>
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='font-semibold text-foreground'>
                              {member.firstName} {member.lastName}
                            </p>
                            <p className='mt-0.5 font-medium text-muted-foreground text-primary/80 text-xs'>
                              {topRole}
                            </p>
                            {member.bio && (
                              <p className='mt-2 line-clamp-2 text-muted-foreground text-xs leading-relaxed'>
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Hover Card */}
                        <div className='pointer-events-none absolute bottom-[105%] left-1/2 z-50 mb-3 ml-0 -translate-x-1/2 opacity-0 shadow-xl transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100'>
                          <div className='absolute inset-x-0 -bottom-4 h-4 bg-transparent' />

                          <div className='w-64 rounded-xl border border-border bg-card p-4 text-card-foreground'>
                            <div className='flex flex-col items-center gap-2 text-center'>
                              <Avatar className='h-16 w-16 border-2 border-background shadow-xs'>
                                {member.avatar && <AvatarImage src={member.avatar} />}
                                <AvatarFallback>
                                  {member.firstName[0]}
                                  {member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <h3 className='font-bold'>
                                  {member.firstName} {member.lastName}
                                </h3>
                                <p className='text-muted-foreground text-xs'>Phân ban điều hành</p>
                              </div>

                              <div className='mb-2 inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground text-xs transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                                {topRole}
                              </div>

                              {parsedSocials.length > 0 && (
                                <div className='flex flex-wrap justify-center gap-1.5 pb-2'>
                                  {parsedSocials.slice(0, 4).map((social: any) => {
                                    if (!social.url) {
                                      return null;
                                    }
                                    const meta = getSocialMeta(social.platform);
                                    const href =
                                      social.url.startsWith("http") || social.url.startsWith("mailto:")
                                        ? social.url
                                        : meta.prefix
                                          ? `${meta.prefix}${social.url}`
                                          : `https://${social.url}`;

                                    return (
                                      <a
                                        className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs transition-colors hover:bg-primary/20'
                                        href={href}
                                        key={social.id || social.platform}
                                        rel='noopener noreferrer'
                                        target='_blank'
                                        title={social.platform}
                                      >
                                        <img alt={meta.platform} className='h-4 w-4 object-contain' src={meta.icon} />
                                      </a>
                                    );
                                  })}
                                </div>
                              )}

                              <a
                                className='inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 font-medium text-primary-foreground text-xs shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                href={member.slug ? `/members/${member.slug}` : "#"}
                              >
                                Xem hồ sơ
                              </a>
                            </div>
                          </div>

                          <div className='absolute -bottom-2 left-1/2 ml-0 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm border-border border-r border-b bg-card' />
                        </div>
                      </div>
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
                    const parsedSocials = Array.isArray(member.socials) ? member.socials : [];
                    const topRole = getTopRole(member.clubRoles);
                    const topDept =
                      member.clubRoles.find((r) => ["DEPARTMENT_LEADER", "DEPARTMENT_VICE_LEADER"].includes(r.position))
                        ?.department?.name || "Thành viên ban";

                    return (
                      <div className='group relative' key={member.id}>
                        {/* Member Card */}
                        <div className='flex h-full w-44 flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center shadow-sm transition-shadow hover:shadow-md'>
                          <Avatar className='h-14 w-14 ring-2 ring-border transition-transform duration-300 group-hover:scale-105 group-hover:ring-primary/50'>
                            <AvatarImage src={member.avatar ?? undefined} />
                            <AvatarFallback className='bg-muted font-bold text-foreground text-sm'>
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='font-semibold text-foreground text-sm'>
                              {member.firstName} {member.lastName}
                            </p>
                            <p className='mt-0.5 text-muted-foreground text-xs'>{topRole}</p>
                          </div>
                        </div>

                        {/* Hover Card */}
                        <div className='pointer-events-none absolute bottom-[105%] left-1/2 z-50 mb-3 ml-0 -translate-x-1/2 opacity-0 shadow-xl transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100'>
                          <div className='absolute inset-x-0 -bottom-4 h-4 bg-transparent' />

                          <div className='w-64 rounded-xl border border-border bg-card p-4 text-card-foreground'>
                            <div className='flex flex-col items-center gap-2 text-center'>
                              <Avatar className='h-16 w-16 border-2 border-background shadow-xs'>
                                {member.avatar && <AvatarImage src={member.avatar} />}
                                <AvatarFallback>
                                  {member.firstName[0]}
                                  {member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <h3 className='font-bold'>
                                  {member.firstName} {member.lastName}
                                </h3>
                                <p className='text-muted-foreground text-xs'>{topDept}</p>
                              </div>

                              <div className='mb-2 inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground text-xs transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                                {topRole}
                              </div>

                              {parsedSocials.length > 0 && (
                                <div className='flex flex-wrap justify-center gap-1.5 pb-2'>
                                  {parsedSocials.slice(0, 4).map((social: any) => {
                                    if (!social.url) {
                                      return null;
                                    }
                                    const meta = getSocialMeta(social.platform);
                                    const href =
                                      social.url.startsWith("http") || social.url.startsWith("mailto:")
                                        ? social.url
                                        : meta.prefix
                                          ? `${meta.prefix}${social.url}`
                                          : `https://${social.url}`;

                                    return (
                                      <a
                                        className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs transition-colors hover:bg-primary/20'
                                        href={href}
                                        key={social.id || social.platform}
                                        rel='noopener noreferrer'
                                        target='_blank'
                                        title={social.platform}
                                      >
                                        <img alt={meta.platform} className='h-4 w-4 object-contain' src={meta.icon} />
                                      </a>
                                    );
                                  })}
                                </div>
                              )}

                              <a
                                className='inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 font-medium text-primary-foreground text-xs shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
                                href={member.slug ? `/members/${member.slug}` : "#"}
                              >
                                Xem hồ sơ
                              </a>
                            </div>
                          </div>

                          <div className='absolute -bottom-2 left-1/2 ml-0 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm border-border border-r border-b bg-card' />
                        </div>
                      </div>
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
