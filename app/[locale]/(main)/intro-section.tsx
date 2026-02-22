import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

const IntroSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.intro" });

  return (
    <section className='w-full bg-background py-20' id='intro'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center gap-12 lg:flex-row'>
          {/* Left: Image */}
          <div className='w-full lg:w-1/2'>
            <div className='relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl'>
              <div className='absolute inset-0 flex items-center justify-center text-muted-foreground'>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
                    <span className='font-black text-3xl text-primary'>M</span>
                  </div>
                  <span className='text-muted-foreground text-sm'>Ảnh hoạt động CLB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div className='flex w-full flex-col gap-6 lg:w-1/2'>
            <div className='inline-flex'>
              <span className='rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm'>
                {t("title")}
              </span>
            </div>
            <h2 className='font-bold text-3xl text-foreground leading-snug tracking-tight sm:text-4xl'>
              CLB Lập trình trên thiết bị di động
            </h2>
            <p className='text-muted-foreground leading-relaxed'>{t("description")}</p>
            <div className='flex flex-wrap gap-3'>
              <Button asChild className='rounded-full'>
                <Link href='/about'>{t("learnMore")}</Link>
              </Button>
              <Button asChild className='rounded-full' variant='outline'>
                <Link href='/members'>{t("viewMembers")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { IntroSection };
