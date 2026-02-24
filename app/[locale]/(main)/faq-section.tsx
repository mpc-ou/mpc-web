import { getTranslations } from "next-intl/server";
import { getFaqItems } from "@/app/[locale]/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

const FaqSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.faq" });

  const { data } = await getFaqItems(locale);
  const items = (data?.payload ?? []) as Array<{
    id: string;
    question: string;
    answer: string;
    order: number;
  }>;

  // No FAQ in DB → don't render section
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-background py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <ScrollReveal className="mb-12 text-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
            FAQ
          </span>
          <h2 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </ScrollReveal>
        <Accordion className="w-full space-y-3" collapsible type="single">
          {items.map((item, idx) => (
            <ScrollReveal delay={idx * 80} key={item.id} variant="fade-up">
              <AccordionItem
                className="rounded-xl border border-border bg-background px-5 shadow-sm"
                value={item.id}
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export { FaqSection };
