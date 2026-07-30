import { getTranslations } from "next-intl/server";
import { getTerminalStats } from "@/app/_actions/main";
import { MPC_FOUNDED_YEAR } from "@/constants/hero";
import { StatsCounter } from "./stats-counter.client";

const StatsSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.stats" });

  const statsRes = await getTerminalStats();
  const payload = (statsRes.data?.payload ?? null) as {
    members: number;
    projects: number;
    events: number;
    currentYear?: number;
  } | null;

  const memberCount = payload?.members ?? 0;
  const eventCount = payload?.events ?? 0;
  const projectCount = payload?.projects ?? 0;
  // currentYear comes from the cached stats payload (computed inside the cache
  // boundary) so we avoid calling new Date() in this non-cache Server Component.
  const currentYear = payload?.currentYear ?? MPC_FOUNDED_YEAR + 10;
  const years = Math.max(1, currentYear - MPC_FOUNDED_YEAR);

  const stats = [
    { label: t("members"), value: memberCount > 0 ? `${memberCount}+` : "50+" },
    { label: t("events"), value: eventCount > 0 ? `${eventCount}+` : "30+" },
    { label: t("years"), value: `${years}+` },
    { label: t("projects"), value: projectCount > 0 ? `${projectCount}+` : "10+" }
  ];

  return <StatsCounter stats={stats} title={t("title")} />;
};

export { StatsSection };
