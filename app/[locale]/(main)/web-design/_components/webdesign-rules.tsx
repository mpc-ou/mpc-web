import { GraduationCap, Rocket, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { cn } from "@/lib/utils";
import { IconTile, WD_CARD, WD_CARD_HOVER, WD_SECTION_IDS, WdSection } from "./wd-primitives";

const RULES = [
  { icon: Users, title: "rules1", desc: "rules1Desc" },
  { icon: GraduationCap, title: "rules2", desc: "rules2Desc" },
  { icon: Rocket, title: "rules3", desc: "rules3Desc" }
] as const;

export function WebDesignRules() {
  const t = useTranslations("webdesign");

  return (
    <WdSection id={WD_SECTION_IDS.rules}>
      <ScrollReveal>
        <SectionHeading description={t("rulesSubtitle")} index='02' tag='rules' title={t("rulesTitle")} />
      </ScrollReveal>
      <div className='grid gap-4 md:grid-cols-3'>
        {RULES.map((rule, idx) => (
          <ScrollReveal className='h-full' delay={idx * 110} key={rule.title}>
            <div className={cn(WD_CARD, WD_CARD_HOVER, "flex h-full flex-col gap-4.5 p-7")}>
              <div className='flex items-center justify-between'>
                <IconTile>
                  <rule.icon className='h-5.5 w-5.5' />
                </IconTile>
                <span className='font-mono text-muted-foreground/70 text-xs'>/0{idx + 1}</span>
              </div>
              <div>
                <h3 className='mb-2 font-extrabold text-xl'>{t(rule.title)}</h3>
                <p className='text-[15px] text-muted-foreground leading-relaxed'>{t(rule.desc)}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </WdSection>
  );
}
