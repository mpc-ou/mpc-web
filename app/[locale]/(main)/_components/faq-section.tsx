import { getTranslations } from "next-intl/server";
import { getFaqItems } from "@/app/_actions/main";
import { FaqAccordion } from "@/components/custom/faq-accordion.client";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";

type FaqSectionProps = {
  locale: string;
  target?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  /** Optional section number shown before the badge, e.g. "09". */
  index?: string;
  id?: string;
  className?: string;
  /** Replaces the default inner container classes (width/padding), e.g. when nested in another container. */
  containerClassName?: string;
};

const FaqSection = async ({
  locale,
  target = "GENERAL",
  title,
  subtitle,
  badge = "faq",
  index,
  id,
  className,
  containerClassName
}: FaqSectionProps) => {
  const t = await getTranslations({ locale, namespace: "home.faq" });

  const { data } = await getFaqItems(locale, target);
  const items = (data?.payload ?? []) as Array<{
    id: string;
    question: string;
    answer: string;
    order: number;
  }>;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("w-full scroll-mt-32 bg-background py-20", className)} id={id}>
      <div
        className={cn(
          "grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
          containerClassName ?? "container mx-auto max-w-6xl px-4"
        )}
      >
        <ScrollReveal className='lg:sticky lg:top-32'>
          <SectionHeading
            description={subtitle ?? t("subtitle")}
            index={index}
            layout='stack'
            tag={badge}
            title={title ?? t("title")}
          />
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <FaqAccordion items={items.map((item) => ({ id: item.id, question: item.question, answer: item.answer }))} />
        </ScrollReveal>
      </div>
    </section>
  );
};

export { FaqSection };
