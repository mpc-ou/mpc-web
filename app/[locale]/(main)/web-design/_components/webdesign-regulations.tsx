import { ArrowUpRight, FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { FaqAccordion, FaqBulletList } from "@/components/custom/faq-accordion.client";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { localizedText, type WebDesignRegulation } from "@/types/webdesign";
import { WD_SECTION_IDS, WdSection } from "./wd-primitives";

export function WebDesignRegulations({ regulations, pdfUrl }: { regulations: WebDesignRegulation[]; pdfUrl?: string }) {
  const t = useTranslations("webdesign");
  const locale = useLocale();

  if (regulations.length === 0) {
    return null;
  }

  const items = regulations.map((rule, idx) => ({
    id: rule.id,
    label: t("regulationsArticle", { no: String(idx + 1).padStart(2, "0") }),
    question: localizedText(locale, rule.title),
    answer: <FaqBulletList items={rule.items.map((item) => localizedText(locale, item)).filter(Boolean)} />
  }));

  return (
    <WdSection id={WD_SECTION_IDS.regulations}>
      <div className='grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
        <ScrollReveal className='flex flex-col gap-4 lg:sticky lg:top-28'>
          <SectionHeading
            description={t("regulationsDesc")}
            index='05'
            layout='stack'
            tag='regulations'
            title={t("regulationsTitle")}
          />
          {pdfUrl ? (
            <a
              className='group flex max-w-sm items-center gap-2.5 rounded-xl border border-orange-500/35 bg-orange-500/8 px-4 py-3.5 text-sm transition-colors hover:border-orange-500/60'
              href={pdfUrl}
              rel='noopener noreferrer'
              target='_blank'
            >
              <FileText className='h-4.5 w-4.5 shrink-0 text-orange-400' />
              <span className='flex-1'>
                {t("regulationsPdfLabel")} -{" "}
                <span className='font-bold text-orange-400'>{t("regulationsPdfOpen")}</span>
              </span>
              <ArrowUpRight className='h-4 w-4 text-orange-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
            </a>
          ) : (
            <div className='flex max-w-sm items-center gap-2.5 rounded-xl border border-border border-dashed px-4 py-3.5 text-muted-foreground text-sm dark:border-white/15'>
              <FileText className='h-4.5 w-4.5 shrink-0' />
              <span>
                {t("regulationsPdfLabel")} -{" "}
                <span className='font-bold text-foreground'>{t("regulationsPdfSoon")}</span>
              </span>
            </div>
          )}
        </ScrollReveal>
        <ScrollReveal delay={110}>
          <FaqAccordion items={items} variant='numbered' />
        </ScrollReveal>
      </div>
    </WdSection>
  );
}
