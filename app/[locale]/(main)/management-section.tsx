import { Facebook, Github, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/configs/i18n/routing";
import { type ClubPosition } from "@/configs/prisma/generated/prisma/client";
import { getLeadership } from "./actions";

const positionLabel: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm CLB",
  VICE_PRESIDENT: "Phó Chủ nhiệm CLB",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban",
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
    m.clubRoles.some(
      (r) => r.position === "PRESIDENT" || r.position === "VICE_PRESIDENT",
    ),
  );
  const departmentHeads = leaders.filter((m) =>
    m.clubRoles.every(
      (r) => r.position !== "PRESIDENT" && r.position !== "VICE_PRESIDENT",
    ),
  );

  const getTopRole = (
    roles: { position: ClubPosition; department: { name: string } | null }[],
  ) => {
    const sorted = [...roles].sort((a, b) => {
      const order = [
        "PRESIDENT",
        "VICE_PRESIDENT",
        "DEPARTMENT_LEADER",
        "DEPARTMENT_VICE_LEADER",
      ];
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
    <section className="w-full bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
            Tổ chức
          </span>
          <h2 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        {leaders.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {t("noLeadership")}
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {/* Executive Board */}
            {executives.length > 0 && (
              <div>
                <h3 className="mb-6 text-center font-semibold text-foreground text-xl">
                  {t("president")}
                </h3>
                <div className="flex flex-wrap justify-center gap-6">
                  {executives.map((member) => {
                    const socials = (member.socials ?? {}) as SocialLinks;
                    return (
                      <div
                        className="flex w-52 flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                        key={member.id}
                      >
                        <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                          <AvatarImage src={member.avatar ?? undefined} />
                          <AvatarFallback className="bg-primary/10 font-bold text-lg text-primary">
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {getTopRole(member.clubRoles)}
                          </p>
                          {member.bio && (
                            <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                              {member.bio}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {socials.facebook && (
                            <a
                              aria-label="Facebook"
                              className="text-muted-foreground hover:text-primary"
                              href={`https://facebook.com/${socials.facebook}`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Facebook className="h-4 w-4" />
                            </a>
                          )}
                          {socials.github && (
                            <a
                              aria-label="GitHub"
                              className="text-muted-foreground hover:text-primary"
                              href={`https://github.com/${socials.github}`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                          {socials.email && (
                            <a
                              aria-label="Email"
                              className="text-muted-foreground hover:text-primary"
                              href={`mailto:${socials.email}`}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
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
                <h3 className="mb-6 text-center font-semibold text-foreground text-xl">
                  {t("staff")}
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {departmentHeads.map((member) => {
                    const socials = (member.socials ?? {}) as SocialLinks;
                    return (
                      <div
                        className="flex w-44 flex-col items-center gap-2 rounded-2xl border border-border bg-background p-4 text-center shadow-sm transition-shadow hover:shadow-md"
                        key={member.id}
                      >
                        <Avatar className="h-14 w-14 ring-2 ring-border">
                          <AvatarImage src={member.avatar ?? undefined} />
                          <AvatarFallback className="bg-muted font-bold text-foreground text-sm">
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="mt-0.5 text-muted-foreground text-xs">
                            {getTopRole(member.clubRoles)}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {socials.facebook && (
                            <a
                              aria-label="Facebook"
                              className="text-muted-foreground hover:text-primary"
                              href={`https://facebook.com/${socials.facebook}`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Facebook className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {socials.github && (
                            <a
                              aria-label="GitHub"
                              className="text-muted-foreground hover:text-primary"
                              href={`https://github.com/${socials.github}`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <Github className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-center">
              <Link
                className="font-medium text-primary text-sm underline-offset-4 hover:underline"
                href="/members"
              >
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
