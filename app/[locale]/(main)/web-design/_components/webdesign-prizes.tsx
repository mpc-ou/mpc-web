import { Award, type LucideIcon, Ticket, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";
import { localizedText, type WebDesignBenefit, type WebDesignPrize } from "@/types/webdesign";
import { WD_CARD, WD_MONO_LABEL, WD_SECTION_IDS, WdSection } from "./wd-primitives";

const TIER_STYLES: Record<WebDesignPrize["tier"], { label: string; title: string }> = {
  gold: { label: "text-yellow-500", title: "text-yellow-500 dark:text-yellow-400" },
  silver: { label: "text-slate-500 dark:text-slate-400", title: "text-slate-600 dark:text-slate-200" },
  bronze: { label: "text-amber-600", title: "text-amber-600 dark:text-amber-500" }
};

const BENEFIT_ACCENTS: Array<{ icon: LucideIcon; className: string }> = [
  { icon: Award, className: "text-orange-400" },
  { icon: Ticket, className: "text-cyan-500 dark:text-cyan-400" }
];

export function WebDesignPrizes({ prizes, benefits }: { prizes: WebDesignPrize[]; benefits: WebDesignBenefit[] }) {
  const t = useTranslations("webdesign");
  const locale = useLocale();

  if (prizes.length === 0 && benefits.length === 0) {
    return null;
  }

  const featured = prizes.filter((p) => p.tier === "gold");
  const others = prizes.filter((p) => p.tier !== "gold");

  return (
    <WdSection id={WD_SECTION_IDS.prizes}>
      <ScrollReveal>
        <SectionHeading index='06' tag='prizes' title={t("prizesTitle")} />
      </ScrollReveal>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {featured.map((prize) => (
          <ScrollReveal className='sm:col-span-2 lg:col-span-4' key={prize.id}>
            <FeaturedPrize
              description={localizedText(locale, prize.description)}
              title={localizedText(locale, prize.title)}
            />
          </ScrollReveal>
        ))}

        {others.map((prize, idx) => {
          const style = TIER_STYLES[prize.tier];
          return (
            <ScrollReveal className='h-full' delay={idx * 110} key={prize.id}>
              <PrizeCard
                description={localizedText(locale, prize.description)}
                icon={Trophy}
                iconClassName={style.label}
                label={`${prize.tier.toUpperCase()} AWARD`}
                labelClassName={style.label}
                title={localizedText(locale, prize.title)}
                titleClassName={style.title}
              />
            </ScrollReveal>
          );
        })}

        {benefits.map((benefit, idx) => {
          const accent = BENEFIT_ACCENTS[idx % BENEFIT_ACCENTS.length] ?? BENEFIT_ACCENTS[0];
          return (
            <ScrollReveal className='h-full' delay={(others.length + idx) * 110} key={benefit.id}>
              <PrizeCard
                description={localizedText(locale, benefit.description)}
                icon={accent.icon}
                iconClassName={accent.className}
                title={localizedText(locale, benefit.title)}
              />
            </ScrollReveal>
          );
        })}
      </div>
    </WdSection>
  );
}

function FeaturedPrize({ title, description }: { title: string; description: string }) {
  return (
    <div className='relative flex flex-wrap items-center gap-6 overflow-hidden rounded-[20px] border border-yellow-500/35 bg-[linear-gradient(135deg,rgba(234,179,8,0.12),transparent_55%)] p-7 sm:p-9'>
      <div className='flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] border border-yellow-400/35 bg-yellow-500/15 text-yellow-500 dark:text-yellow-400'>
        <Trophy className='h-10 w-10' strokeWidth={1.75} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className={cn(WD_MONO_LABEL, "text-yellow-500")}>GOLD AWARD</div>
        <h3 className='mt-1 mb-1.5 font-black text-3xl text-yellow-500 dark:text-yellow-400'>{title}</h3>
        <p className='text-[15px] text-muted-foreground'>{description}</p>
      </div>
    </div>
  );
}

function PrizeCard({
  icon: Icon,
  iconClassName,
  label,
  labelClassName,
  title,
  titleClassName,
  description
}: {
  icon: LucideIcon;
  iconClassName?: string;
  label?: string;
  labelClassName?: string;
  title: string;
  titleClassName?: string;
  description: string;
}) {
  return (
    <div className={cn(WD_CARD, "flex h-full flex-col gap-3.5 p-7")}>
      <div className='flex items-center justify-between gap-3'>
        {label ? <span className={cn(WD_MONO_LABEL, labelClassName)}>{label}</span> : <span />}
        <Icon className={cn("h-6 w-6", iconClassName)} strokeWidth={1.75} />
      </div>
      <h3 className={cn("font-black text-[22px]", titleClassName)}>{title}</h3>
      <p className='text-muted-foreground text-sm leading-relaxed'>{description}</p>
    </div>
  );
}
