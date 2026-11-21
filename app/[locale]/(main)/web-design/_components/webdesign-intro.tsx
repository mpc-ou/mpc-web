import { useTranslations } from "next-intl";
import { SectionEyebrow, SectionTitle } from "@/components/custom/section-heading";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { WD_SECTION_IDS, WdSection, WindowDots } from "./wd-primitives";

const HASHTAGS = [
  { tag: "#ui_ux", className: "border-orange-500/25 bg-orange-500/8 text-orange-400" },
  { tag: "#frontend", className: "border-blue-500/25 bg-blue-500/8 text-blue-400" },
  { tag: "#collaboration", className: "border-emerald-500/25 bg-emerald-500/8 text-emerald-400" }
];

const KEY = "text-sky-500 dark:text-sky-400";
const STR = "text-amber-600 dark:text-amber-300";
const PUNCT = "text-pink-500";

export function WebDesignIntro() {
  const t = useTranslations("webdesign");

  return (
    <WdSection id={WD_SECTION_IDS.intro}>
      <div className='grid items-center gap-14 lg:grid-cols-2'>
        <ScrollReveal className='flex flex-col gap-5'>
          <SectionEyebrow index='01' tag={t("tag").toLowerCase()} />
          <SectionTitle>{t("purpose")}</SectionTitle>
          <p className='text-pretty text-[17px] text-muted-foreground leading-[1.75]'>{t("purposeDesc")}</p>
          <p className='border-[#ff5e00] border-l-2 pl-4.5 text-[17px] text-foreground leading-[1.75]'>
            {t("purposeHighlight")}
          </p>
          <div className='flex flex-wrap gap-2 pt-1'>
            {HASHTAGS.map((item) => (
              <span
                className={`rounded-full border px-3 py-1 font-mono font-semibold text-xs ${item.className}`}
                key={item.tag}
              >
                {item.tag}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={110}>
          <div className='overflow-hidden rounded-2xl border border-border/60 bg-card/60 dark:border-white/10 dark:bg-[#0e1013]'>
            <div className='flex h-10 items-center gap-3.5 border-border/60 border-b bg-muted/60 px-3.5 dark:border-white/7 dark:bg-[#16181c]'>
              <WindowDots />
              <span className='rounded-md bg-foreground/6 px-2.5 py-1 font-mono text-foreground text-xs'>
                purpose.json
              </span>
            </div>
            <pre className='grid grid-cols-[28px_1fr] gap-x-3.5 overflow-x-auto px-6 py-7 font-mono text-[13.5px] text-foreground/80 leading-[1.9]'>
              <span aria-hidden='true' className='select-none text-right text-muted-foreground/60'>
                {Array.from({ length: 11 }, (_, i) => i + 1).join("\n")}
              </span>
              <code>
                <span className={PUNCT}>{"{"}</span>
                {"\n  "}
                <span className={KEY}>"competition"</span>: <span className={STR}>"Web Design"</span>,{"\n  "}
                <span className={KEY}>"organizer"</span>: <span className={STR}>"Mobile Dev Club"</span>,{"\n  "}
                <span className={KEY}>"frequency"</span>:{" "}
                <span className='text-emerald-600 dark:text-emerald-400'>"Annual"</span>,{"\n  "}
                <span className={KEY}>"purpose"</span>: <span className='text-orange-400'>"{t("purpose")}"</span>,
                {"\n  "}
                <span className={KEY}>"skills"</span>: <span className={PUNCT}>[</span>
                {"\n    "}
                <span className={STR}>"UI/UX Design"</span>,{"\n    "}
                <span className={STR}>"Frontend Dev"</span>,{"\n    "}
                <span className={STR}>"Teamwork"</span>
                {"\n  "}
                <span className={PUNCT}>]</span>
                {"\n"}
                <span className={PUNCT}>{"}"}</span>
              </code>
            </pre>
          </div>
        </ScrollReveal>
      </div>
    </WdSection>
  );
}
