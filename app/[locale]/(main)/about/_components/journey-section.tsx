import { getJourneyTimeline } from "@/app/_actions/main";
import { JourneyTimeline, type TimelineItem } from "./journey-timeline.client";

const JourneySection = async ({ locale }: { locale: string }) => {
  const { data } = await getJourneyTimeline(locale);
  const items = (data?.payload as { items: TimelineItem[] } | undefined)?.items ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className='h-svh max-h-[1080px] min-h-[640px] w-full overflow-hidden border-border border-t bg-background py-10 sm:py-14'
      id='journey'
    >
      <JourneyTimeline items={items} />
    </section>
  );
};

export { JourneySection };
