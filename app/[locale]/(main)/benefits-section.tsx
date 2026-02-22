import { BookOpen, Network, Rocket, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

const benefits = [
  { key: "skills", Icon: BookOpen },
  { key: "network", Icon: Network },
  { key: "opportunity", Icon: Rocket },
  { key: "community", Icon: Users }
] as const;

const BenefitsSection = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "home.benefits" });

  return (
    <section className='w-full bg-muted/50 py-20'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <span className='rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm'>CLB MPC</span>
          <h2 className='mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-4xl'>{t("title")}</h2>
          <p className='mt-3 text-muted-foreground'>{t("subtitle")}</p>
        </div>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {benefits.map(({ key, Icon }) => (
            <div
              className='flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md'
              key={key}
            >
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10'>
                <Icon className='h-6 w-6 text-primary' />
              </div>
              <div className='flex flex-col gap-1'>
                <h3 className='font-semibold text-foreground'>{t(`${key}.title`)}</h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>{t(`${key}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { BenefitsSection };
