import { getTranslations } from "next-intl/server";
import { getMemberCount, getUpcomingEventsCount } from "./actions";

const StatsSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.stats" });

  const [membersResult, eventsResult] = await Promise.allSettled([
    getMemberCount(),
    getUpcomingEventsCount(),
  ]);

  // Re-throw AbortError so Next.js can handle render cancellation properly
  for (const result of [membersResult, eventsResult]) {
    if (
      result.status === "rejected" &&
      result.reason instanceof Error &&
      result.reason.name === "AbortError"
    ) {
      throw result.reason;
    }
  }

  const membersRes =
    membersResult.status === "fulfilled" ? membersResult.value : null;
  const eventsRes =
    eventsResult.status === "fulfilled" ? eventsResult.value : null;

  const memberCount =
    (membersRes?.data?.payload as { count: number } | undefined)?.count ?? 0;
  const eventCount =
    (eventsRes?.data?.payload as { count: number } | undefined)?.count ?? 0;

  const stats = [
    { label: t("members"), value: memberCount > 0 ? `${memberCount}+` : "50+" },
    { label: t("events"), value: eventCount > 0 ? `${eventCount}+` : "30+" },
    { label: t("years"), value: "7+" },
    { label: t("projects"), value: "20+" },
  ];

  return (
    <section className="w-full bg-primary py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center font-bold text-2xl text-primary-foreground">
          {t("title")}
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              className="flex flex-col items-center gap-1 text-center"
              key={stat.label}
            >
              <span className="font-black text-4xl text-primary-foreground sm:text-5xl">
                {stat.value}
              </span>
              <span className="font-medium text-primary-foreground/80 text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { StatsSection };
