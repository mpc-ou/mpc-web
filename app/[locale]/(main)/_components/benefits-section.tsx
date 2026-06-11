import { BookOpen, Network, Rocket, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";

const benefits = [
  { key: "skills", Icon: BookOpen, accent: "from-orange-500/20" },
  { key: "network", Icon: Network, accent: "from-amber-500/20" },
  { key: "opportunity", Icon: Rocket, accent: "from-orange-600/20" },
  { key: "community", Icon: Users, accent: "from-amber-400/20" }
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

        <div
          className={cn(
            compact ? "mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4" : "mx-auto max-w-3xl space-y-5"
          )}
        >
          {benefits.map(({ key, Icon, accent }, idx) => (
            <ScrollReveal delay={idx * 120} key={key} variant={idx % 2 === 0 ? "fade-left" : "fade-right"}>
              <div
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-orange-500/30",
                  compact ? "flex h-full flex-col items-start gap-4" : "sm:flex sm:items-center sm:gap-6 sm:p-8"
                )}
              >
                <div
                  className={`absolute inset-0 bg-linear-to-r ${accent} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className='relative shrink-0'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 transition-colors group-hover:bg-orange-500/20'>
                    <Icon className='h-6 w-6 text-orange-500' />
                  </div>
                </div>

                <div className='relative min-w-0'>
                  <h3 className='mb-1.5 font-bold text-foreground text-lg'>{t(`${key}.title`)}</h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>{t(`${key}.desc`)}</p>
                </div>

                {!compact && (
                  <div className='relative mt-4 shrink-0 sm:mt-0 sm:ml-auto'>
                    <span className='inline-flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1 font-mono text-orange-500 text-xs opacity-0 transition-all duration-300 group-hover:opacity-100'>
                      #{idx + 1}
                    </span>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export { BenefitsSection };
