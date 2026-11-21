import { Mail, SquareTerminal } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";

type Props = {
  locale: string;
  fanpageUrl: string;
  email: string;
};

type Step = { title: string; meta: string };

const RecruitCtaSection = async ({ locale, fanpageUrl, email }: Props) => {
  const t = await getTranslations({ locale, namespace: "aboutPage.cta" });
  const steps = t.raw("steps") as Step[];

  return (
    <section className='w-full bg-background py-20 sm:py-24'>
      <div className='container mx-auto px-4'>
        <ScrollReveal variant='fade-up'>
          <div className='relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-zinc-950 sm:px-12 sm:py-14 lg:px-16'>
            <span
              aria-hidden
              className='pointer-events-none absolute -right-6 -bottom-16 select-none font-black text-[clamp(8rem,22vw,18rem)] text-black/[0.07] leading-none tracking-tighter'
            >
              MPC
            </span>

            <div className='relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16'>
              <div className='flex flex-col gap-5'>
                <span className='font-medium font-mono text-xs text-zinc-950/75 sm:text-sm'>{t("eyebrow")}</span>
                <h2 className='max-w-[14ch] text-balance font-black text-4xl leading-[1.05] tracking-tight sm:text-5xl'>
                  {t("title")}
                </h2>
                <p className='max-w-xl text-zinc-950/80 leading-relaxed sm:text-lg'>{t("description")}</p>
                <div className='mt-2 flex flex-wrap gap-3'>
                  <a
                    className='inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3.5 font-semibold text-sm text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl sm:text-base'
                    href={fanpageUrl}
                    rel='noopener noreferrer'
                    target='_blank'
                  >
                    <SquareTerminal className='h-4 w-4 text-primary' />
                    {t("primary")}
                  </a>
                  <a
                    className='inline-flex items-center gap-2 rounded-xl border-2 border-zinc-950/80 px-5 py-3 font-semibold text-sm text-zinc-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-950/10 sm:text-base'
                    href={`mailto:${email}`}
                  >
                    <Mail className='h-4 w-4' />
                    {t("secondary")}
                  </a>
                </div>
              </div>

              <div className='w-full max-w-md justify-self-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-zinc-100 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] lg:justify-self-end'>
                <div className='flex items-center gap-2 border-white/10 border-b px-4 py-3'>
                  <span className='h-2.5 w-2.5 rounded-full bg-red-400' />
                  <span className='h-2.5 w-2.5 rounded-full bg-amber-400' />
                  <span className='h-2.5 w-2.5 rounded-full bg-emerald-400' />
                  <span className='ml-2 font-mono text-[11px] text-zinc-500'>recruitment.log</span>
                </div>
                <ol className='flex flex-col gap-4 px-5 pt-5 pb-4'>
                  {steps.map((step, idx) => (
                    <li className='flex items-center gap-3' key={step.title}>
                      <span
                        className={
                          idx === 0
                            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary font-bold font-mono text-[11px] text-primary-foreground"
                            : "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 font-bold font-mono text-[11px] text-zinc-300"
                        }
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className='flex-1 font-semibold text-sm'>{step.title}</span>
                      <span className='font-mono text-[11px] text-zinc-500'>{step.meta}</span>
                    </li>
                  ))}
                </ol>
                <div className='mx-5 flex items-center justify-between gap-4 border-white/10 border-t border-dashed py-4 font-mono text-[11px]'>
                  <span className='text-zinc-500'>{t("statusKey")}</span>
                  <span className='text-right text-primary'>{t("statusValue")}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export { RecruitCtaSection };
