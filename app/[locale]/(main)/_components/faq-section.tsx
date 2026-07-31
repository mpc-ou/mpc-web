import { getTranslations } from "next-intl/server";
import { getFaqItems } from "@/app/_actions/main";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";

type FaqSectionProps = {
  locale: string;
  target?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
};

const FaqSection = async ({
  locale,
  target = "GENERAL",
  title,
  subtitle,
  badge = "faq",
  className
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

  const sectionTitle = title ?? t("title");
  const sectionSubtitle = subtitle ?? t("subtitle");

  return (
    <section className={cn("w-full bg-background py-20", className)}>
      <div className='container mx-auto max-w-3xl px-4'>
        <ScrollReveal className='mb-12 text-center'>
          {badge && (
            <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm uppercase'>
              &gt; {badge}
            </span>
          )}
          {sectionTitle && (
            <h2 className='mt-4 font-black text-3xl text-foreground uppercase tracking-tight sm:text-4xl'>
              {sectionTitle}
            </h2>
          )}
          {sectionSubtitle && <p className='mt-3 text-muted-foreground text-sm'>{sectionSubtitle}</p>}
        </ScrollReveal>
        <Accordion className='w-full space-y-3' collapsible type='single'>
          {items.map((item, idx) => (
            <ScrollReveal delay={idx * 80} key={item.id} variant='fade-up'>
              <AccordionItem
                className='rounded-xl border border-border bg-card/80 px-5 shadow-sm backdrop-blur-xl transition-all hover:border-orange-500/30 dark:border-white/10 dark:bg-slate-900/40'
                value={item.id}
              >
                <AccordionTrigger className='text-left font-medium text-foreground hover:text-orange-500 hover:no-underline'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className='text-muted-foreground leading-relaxed'>{item.answer}</AccordionContent>
              </AccordionItem>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export { FaqSection };
