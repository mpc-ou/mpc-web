import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getSponsorLogos } from "@/app/_actions/main";
import { SectionEyebrow } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";

type SponsorLogo = { id: string; name: string; nameEn: string; logo: string };

const SponsorsStripSection = async ({ locale }: { locale: string }) => {
  const [{ data }, t] = await Promise.all([getSponsorLogos(), getTranslations({ locale, namespace: "home.sponsors" })]);
  const sponsors = (data?.payload as { sponsors: SponsorLogo[] } | undefined)?.sponsors ?? [];

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className='w-full border-border border-y bg-background py-12 sm:py-14'>
      <div className='container mx-auto flex flex-col gap-8 px-4 lg:flex-row lg:items-center lg:gap-12'>
        <ScrollReveal className='flex shrink-0 flex-col gap-2 lg:w-64'>
          <SectionEyebrow tag='sponsors' />
          <p className='font-bold text-foreground text-xl leading-snug'>{t("title")}</p>
          <Link
            className='group inline-flex items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-primary'
            href='/sponsors'
          >
            {t("viewAll")}
            <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
          </Link>
        </ScrollReveal>

        <ul className='flex flex-1 flex-wrap items-center gap-x-10 gap-y-6'>
          {sponsors.map((s) => {
            const name = locale === "en" && s.nameEn ? s.nameEn : s.name;
            return (
              <li className='relative h-12 w-32' key={s.id} title={name}>
                <Image
                  alt={name}
                  className='object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0'
                  fill
                  sizes='128px'
                  src={s.logo}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export { SponsorsStripSection };
