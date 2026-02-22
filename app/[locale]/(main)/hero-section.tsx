import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

const HeroSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.hero" });

  return (
    <section
      className='relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 text-white'
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(249, 115, 22, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(29, 78, 216, 0.15) 0%, transparent 50%)
        `
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className='absolute inset-0 opacity-5'
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center gap-6 text-center'>
        {/* Logo icon */}
        <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-primary font-black text-4xl text-white shadow-2xl ring-4 ring-primary/30'>
          M
        </div>

        <div className='flex flex-col gap-3'>
          <h1 className='max-w-3xl font-black text-3xl leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
            {t("title")}
          </h1>
          <p className='text-lg text-white/70 sm:text-xl'>{t("subtitle")}</p>
        </div>

        <div className='flex flex-wrap items-center justify-center gap-4 pt-2'>
          <Button
            asChild
            className='rounded-full bg-primary px-6 py-3 font-semibold text-base text-white shadow-lg hover:bg-primary/90'
            size='lg'
          >
            <a href='#intro'>{t("cta")}</a>
          </Button>
          <Button
            asChild
            className='rounded-full border-white/40 px-6 py-3 font-semibold text-base text-white hover:bg-white/10'
            size='lg'
            variant='outline'
          >
            <Link href='/auth'>{t("ctaJoin")}</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce'>
        <div className='flex h-6 w-4 items-start justify-center rounded-full border-2 border-white/40 pt-1'>
          <div className='h-1.5 w-0.5 rounded-full bg-white/60' />
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
