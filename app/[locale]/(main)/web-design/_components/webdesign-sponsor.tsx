import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";
import { WD_CARD } from "./wd-primitives";

export function WebDesignSponsor({ proposalUrl, sponsorUrl }: { proposalUrl?: string; sponsorUrl?: string }) {
  const t = useTranslations("webdesign");

  return (
    <ScrollReveal className='mt-4'>
      <div className={cn(WD_CARD, "flex flex-wrap items-center justify-between gap-6 rounded-[20px] px-8 py-7")}>
        <div className='flex max-w-160 flex-col gap-1.5'>
          <span className='font-mono text-blue-400 text-xs'>&gt; partnership</span>
          <h3 className='font-black text-[22px]'>{t("sponsorHeading")}</h3>
          <p className='text-[15px] text-muted-foreground leading-relaxed'>
            {t.rich("sponsorDesc", { b: (chunks) => <strong className='text-foreground'>{chunks}</strong> })}
          </p>
        </div>
        {(sponsorUrl || proposalUrl) && (
          <div className='flex flex-wrap gap-2.5'>
            {sponsorUrl && (
              <a
                className='inline-flex h-11.5 items-center rounded-[10px] bg-foreground px-5 font-extrabold text-[15px] text-background transition-opacity hover:opacity-90'
                href={sponsorUrl}
                rel='noopener noreferrer'
                target='_blank'
              >
                {t("sponsorCtaBtn")}
              </a>
            )}
            {proposalUrl && (
              <a
                className='inline-flex h-11.5 items-center rounded-[10px] border border-border px-5 font-bold text-[15px] transition-colors hover:border-orange-500/50 dark:border-white/15'
                href={proposalUrl}
                rel='noopener noreferrer'
                target='_blank'
              >
                {t("proposalBtn")}
              </a>
            )}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
