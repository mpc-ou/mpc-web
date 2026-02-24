import { getTranslations } from "next-intl/server";
import { getMemberCount, getUpcomingEventsCount } from "@/app/[locale]/actions";
import { StatsCounter } from "./stats-counter.client";

const StatsSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.stats" });

  const [membersResult, eventsResult] = await Promise.allSettled([getMemberCount(), getUpcomingEventsCount()]);

  for (const result of [membersResult, eventsResult]) {
    if (result.status === "rejected" && result.reason instanceof Error && result.reason.name === "AbortError") {
      throw result.reason;
    }
  }

  const membersRes = membersResult.status === "fulfilled" ? membersResult.value : null;
  const eventsRes = eventsResult.status === "fulfilled" ? eventsResult.value : null;

  const memberCount = (membersRes?.data?.payload as { count: number } | undefined)?.count ?? 0;
  const eventCount = (eventsRes?.data?.payload as { count: number } | undefined)?.count ?? 0;

  const stats = [
    { label: t("members"), value: memberCount > 0 ? `${memberCount}+` : "50+" },
    { label: t("events"), value: eventCount > 0 ? `${eventCount}+` : "30+" },
    { label: t("years"), value: "10+" },
    { label: t("projects"), value: "10+" }
  ];

  return <StatsCounter stats={stats} title={t("title")} />;
};

export { StatsSection };
