import { CalendarDays, Lightbulb, PanelsTopLeft, SquareCheckBig } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { WD_SECTION_IDS, WdSection } from "./wd-primitives";

const CRITERIA = [
  { icon: PanelsTopLeft, title: "criteria1", desc: "criteria1Desc" },
  { icon: CalendarDays, title: "criteria2", desc: "criteria2Desc" },
  { icon: Lightbulb, title: "criteria3", desc: "criteria3Desc" },
  { icon: SquareCheckBig, title: "criteria4", desc: "criteria4Desc" }
] as const;

export function WebDesignCriteria() {
  const t = useTranslations("webdesign");

  return (
    <WdSection id={WD_SECTION_IDS.criteria}>
      <ScrollReveal>
        <SectionHeading description={t("criteriaSubtitle")} index='04' tag='criteria' title={t("criteriaTitle")} />
      </ScrollReveal>
      {/* gap-px over a border-colored background draws the inner dividers at any column count. */}
      <ScrollReveal>
        <div className='grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/10'>
          {CRITERIA.map((item) => (
            <div className='flex flex-col gap-4 bg-background px-7 py-8' key={item.title}>
              <item.icon className='h-7 w-7 text-emerald-500 dark:text-emerald-400' strokeWidth={1.75} />
              <h3 className='font-extrabold text-xl'>{t(item.title)}</h3>
              <p className='text-[14.5px] text-muted-foreground leading-relaxed'>{t(item.desc)}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </WdSection>
  );
}
