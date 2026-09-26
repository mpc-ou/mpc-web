import { useTranslations } from "next-intl";
import { SectionEyebrow } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { ABOUT_CLUB } from "@/configs/data/about";

const PRIMARY_BTN =
  "inline-flex h-13 items-center gap-2.5 rounded-xl bg-[#ff5e00] px-6.5 font-extrabold text-base text-white transition-colors hover:bg-[#ff7a2e]";
const OUTLINE_BTN =
  "inline-flex h-13 items-center gap-2.5 rounded-xl border border-border px-6 font-bold text-base text-foreground transition-colors hover:border-orange-500/50 dark:border-white/15";

export function WebDesignCta({ registerUrl, year }: { registerUrl?: string; year: number }) {
  const t = useTranslations("webdesign");

  return (
    <ScrollReveal>
      <div className='relative grid items-center gap-10 overflow-hidden rounded-3xl border border-orange-500/30 bg-[linear-gradient(120deg,rgba(255,94,0,0.16),transparent_60%)] bg-card/60 p-[clamp(2rem,5vw,4rem)] lg:grid-cols-2'>
        <div className='pointer-events-none absolute -top-25 -right-25 h-90 w-90 rounded-full bg-orange-500/25 blur-[120px] motion-safe:animate-wd-drift-reverse' />

        <div className='relative flex flex-col gap-4.5'>
          <SectionEyebrow className='text-orange-400' tag={t("joinTitle")} />
          <h2 className='whitespace-pre-line font-black text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.05] tracking-[-0.03em]'>
            {t("joinHeading")}
          </h2>
          <p className='max-w-[480px] text-base text-muted-foreground leading-[1.7]'>{t("joinDesc")}</p>
          <div className='flex flex-wrap gap-3 pt-1.5'>
            {registerUrl && (
              <a className={PRIMARY_BTN} href={registerUrl} rel='noopener noreferrer' target='_blank'>
                {t("registerBtn")} →
              </a>
            )}
            <a
              className={registerUrl ? OUTLINE_BTN : PRIMARY_BTN}
              href={ABOUT_CLUB.contact.facebook}
              rel='noopener noreferrer'
              target='_blank'
            >
              {t("followUpBtn")}
            </a>
          </div>
        </div>

        <div className='relative rounded-[14px] border border-white/8 bg-black/80 px-6 py-5.5 font-mono text-[13.5px] text-slate-400 leading-loose dark:bg-black/45'>
          <div>
            <span className='text-orange-400'>$</span> npm init <span className='text-amber-300'>mpc-webdesign</span>{" "}
            --year={year}
          </div>
          <div className='text-emerald-400'>&gt; Fetching latest rules... success [200 OK]</div>
          <div className='text-emerald-400'>&gt; Preparing registration form... success [200 OK]</div>
          <div>
            <span className='text-orange-400'>$</span> mpc register --team=your-team-name
          </div>
          <div className='text-slate-500 italic'>
            &gt; Standing by<span className='motion-safe:animate-blink-cursor'>_</span>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
