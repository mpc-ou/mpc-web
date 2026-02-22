import { getTranslations } from "next-intl/server";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFaqItems } from "./actions";

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
    <section className='w-full bg-background py-20'>
      <div className='container mx-auto max-w-3xl px-4'>
        <div className='mb-12 text-center'>
          <span className='rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm'>FAQ</span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t("title")}</h2>
          <p className='mt-3 text-muted-foreground'>{t("subtitle")}</p>
        </div>
        <Accordion className='w-full space-y-3' collapsible type='single'>
          {items.map((item) => (
            <AccordionItem
              className='rounded-xl border border-border bg-background px-5 shadow-sm'
              key={item.id}
              value={item.id}
            >
              <AccordionTrigger className='text-left font-medium text-foreground hover:text-primary hover:no-underline'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='text-muted-foreground leading-relaxed'>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export { FaqSection };
