import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";

const benefits = [
  { key: "skills", image: "/images/training/methodology-project.jpg" },
  { key: "network", image: "/images/sharing/2025_1.jpg" },
  { key: "opportunity", image: "/images/web-design/2023_1.jpg" },
  { key: "community", image: "/images/toc/2025_4.jpg" }
] as const;

const BenefitsSection = async ({ locale, compact = false }: { locale: string; compact?: boolean }) => {
  const t = await getTranslations({ locale, namespace: "home.benefits" });

  return (
    <section className={cn("w-full bg-background py-20 sm:py-24", compact && "border-border border-t")}>
      <div className='container mx-auto px-4'>
        <ScrollReveal>
          <SectionHeading description={t("subtitle")} tag='why_join' title={t("title")} />
        </ScrollReveal>

        <ul className='[&::-webkit-scrollbar]:hidden! -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]! sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-5'>
          {benefits.map(({ key, image }, idx) => (
            <ScrollReveal
              as='li'
              className='w-[80%] shrink-0 snap-start sm:w-auto'
              delay={idx * 100}
              key={key}
              variant='fade-up'
            >
              <div className='group flex flex-col gap-4'>
                <div className='relative aspect-4/3 overflow-hidden rounded-2xl border border-border bg-muted transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-[0_20px_40px_-20px_hsl(var(--primary)/0.55)] lg:aspect-square'>
                  <Image
                    alt={t(`${key}.title`)}
                    className='object-cover transition-transform duration-700 ease-out group-hover:scale-110'
                    fill
                    sizes='(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
                    src={image}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100' />
                  <span className='absolute top-3 left-3 rounded-md bg-primary px-2 py-0.5 font-bold font-mono text-primary-foreground text-xs shadow-sm'>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className='flex flex-col gap-1.5 px-1'>
                  <h3 className='font-bold text-foreground text-lg transition-colors group-hover:text-primary'>
                    {t(`${key}.title`)}
                  </h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>{t(`${key}.desc`)}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
};

export { BenefitsSection };
