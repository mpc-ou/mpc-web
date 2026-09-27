import { getTranslations } from "next-intl/server";
import { SectionEyebrow, SectionTitle } from "@/components/custom/section-heading";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";
import { Link } from "@/configs/i18n/routing";
import { IntroImageClient } from "./intro-image.client";

const IntroSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.intro" });
  const isEn = locale === "en";

  return (
    <section className='w-full bg-background py-20 sm:py-24' id='intro'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center gap-12 lg:flex-row'>
          <ScrollReveal className='w-full lg:w-1/2' variant='fade-left'>
            <IntroImageClient />
          </ScrollReveal>

          <ScrollReveal className='flex w-full flex-col gap-6 lg:w-1/2' delay={200} variant='fade-right'>
            <div className='flex flex-col gap-3'>
              <SectionEyebrow tag='about_mpc' />
              <SectionTitle>{isEn ? ABOUT_CLUB.fullName.en : ABOUT_CLUB.fullName.vi}</SectionTitle>
              <span className='font-mono text-muted-foreground/60 text-xs'>
                {"/** @club MPC \u2022 @since 2015 */"}
              </span>
            </div>

            <div className='relative rounded-xl border border-primary/10 bg-primary/3 px-5 py-4'>
              <span className='absolute -top-2.5 left-4 bg-background px-2 font-mono text-primary/60 text-xs'>
                README.md
              </span>
              <p className='text-muted-foreground leading-relaxed'>{t("description")}</p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Button
                asChild
                className='rounded-xl bg-primary shadow-md shadow-primary/20 transition-all hover:bg-primary/90'
              >
                <Link href='/about'>{t("learnMore")}</Link>
              </Button>
              <Button asChild className='rounded-xl' variant='outline'>
                <Link href='/members'>{t("viewMembers")}</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export { IntroSection };
