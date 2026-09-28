import { getTranslations } from "next-intl/server";
import { getLatestFeed } from "@/app/_actions/main";
import type { FeedItem } from "@/app/_actions/main/feed";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { LatestFeed } from "./latest-feed.client";

const LatestFeedSection = async ({ locale }: { locale: string }) => {
  const [{ data }, t] = await Promise.all([getLatestFeed(locale), getTranslations({ locale, namespace: "home.feed" })]);
  const items = (data?.payload as { items: FeedItem[] } | undefined)?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className='w-full bg-background pt-16 pb-10 sm:pt-20 sm:pb-12' id='latest'>
      <div className='container mx-auto px-4'>
        <ScrollReveal>
          <SectionHeading className='mb-6' description={t("description")} tag='latest' title={t("title")} />
        </ScrollReveal>
        <LatestFeed items={items} />
      </div>
    </section>
  );
};

export { LatestFeedSection };
