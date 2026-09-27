import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getFooterData } from "@/app/_actions/main";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";

const JoinCtaSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.cta" });
  const { data } = await getFooterData();
  const settings = (data?.payload as { settings?: Record<string, string> } | undefined)?.settings;
  const fanpage = settings?.footer_fanpage || ABOUT_CLUB.contact.facebook;

  return (
    <section className='w-full bg-background py-20 sm:py-24'>
      <div className='container mx-auto px-4'>
        <ScrollReveal variant='fade-up'>
          <div className='group relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-14 sm:py-16'>
            <div
              aria-hidden
              className='pointer-events-none absolute top-1/2 -right-24 h-[26rem] w-[26rem] -translate-y-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-primary-foreground/20 border-dashed motion-reduce:animate-none sm:-right-10'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute top-1/2 -right-4 h-64 w-64 -translate-y-1/2 animate-[spin_40s_linear_infinite_reverse] rounded-full border border-primary-foreground/15 border-dashed motion-reduce:animate-none sm:right-16'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-ach-sheen'
            />

            <div className='relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between'>
              <div className='flex flex-col gap-4'>
                <span className='font-medium font-mono text-primary-foreground/80 text-xs sm:text-sm'>
                  {t("eyebrow")}
                </span>
                <h2 className='max-w-[15ch] text-balance font-black text-3xl leading-[1.05] tracking-tight sm:text-5xl'>
                  {t("title")}
                </h2>
              </div>
              <a
                className='group/cta inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-secondary px-6 py-3.5 font-semibold text-secondary-foreground text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:text-base md:self-auto'
                href={fanpage}
                rel='noopener noreferrer'
                target='_blank'
              >
                {t("button")}
                <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1' />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export { JoinCtaSection };
