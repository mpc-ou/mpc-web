import { BookOpen, Network, Rocket, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";

const benefits = [
  { key: "skills", Icon: BookOpen },
  { key: "network", Icon: Network },
  { key: "opportunity", Icon: Rocket },
  { key: "community", Icon: Users }
] as const;

const BenefitsSection = async ({ locale, compact = false }: { locale: string; compact?: boolean }) => {
  const t = await getTranslations({ locale, namespace: "home.benefits" });

  return (
    <section className={cn("w-full py-20", compact ? "border-border border-t bg-muted/30" : "bg-muted/50")}>
      <div className='container mx-auto px-4'>
        <ScrollReveal className={cn("text-center", compact ? "mb-10" : "mb-16")}>
          <span className='rounded-full bg-orange-500/10 px-3 py-1 font-medium font-mono text-orange-500 text-sm'>
            &gt; why_join
          </span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t("title")}</h2>
          <p className='mt-3 text-muted-foreground'>{t("subtitle")}</p>
        </ScrollReveal>

        {/* Terminal-log styled list — a numbered, connected sequence rather
            than a grid of interchangeable cards. */}
        <div className='mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-card/60 shadow-sm backdrop-blur-sm'>
          <div className='flex items-center gap-2 border-border border-b bg-muted/60 px-4 py-2.5'>
            <span className='h-2.5 w-2.5 rounded-full bg-red-500/70' />
            <span className='h-2.5 w-2.5 rounded-full bg-yellow-500/70' />
            <span className='h-2.5 w-2.5 rounded-full bg-green-500/70' />
            <span className='ml-2 font-mono text-muted-foreground text-xs'>cat ./why-join.log</span>
          </div>

          <div className='relative px-6 py-8 sm:px-10'>
            {/* connecting rail */}
            <div aria-hidden className='absolute top-10 bottom-10 left-9.5 w-px bg-border sm:left-11.5' />

            <ul className='space-y-8'>
              {benefits.map(({ key, Icon }, idx) => (
                <ScrollReveal as='li' delay={idx * 100} key={key} variant='fade-left'>
                  <div className='group relative flex gap-4 sm:gap-6'>
                    <div className='relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-background shadow-sm transition-colors duration-300 group-hover:border-orange-500 group-hover:bg-orange-500/10 sm:h-14 sm:w-14'>
                      <Icon className='h-5 w-5 text-orange-500 sm:h-6 sm:w-6' />
                    </div>

                    <div className='min-w-0 pt-1'>
                      <div className='mb-1 flex items-baseline gap-2 font-mono text-orange-500/70 text-xs'>
                        <span>[{String(idx + 1).padStart(2, "0")}]</span>
                      </div>
                      <h3 className='font-bold text-foreground text-lg'>{t(`${key}.title`)}</h3>
                      <p className='mt-1 text-muted-foreground text-sm leading-relaxed'>{t(`${key}.desc`)}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export { BenefitsSection };
