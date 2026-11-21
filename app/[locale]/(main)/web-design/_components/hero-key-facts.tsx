import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const FACTS = [
  { label: "fact1Label", value: "fact1Value" },
  { label: "fact2Label", value: "fact2Value" },
  { label: "fact3Label", value: "fact3Value" },
  { label: "fact4Label", value: "fact4Value", highlight: true }
] as const;

export function HeroKeyFacts() {
  const t = useTranslations("webdesign");

  return (
    <dl className='relative mx-auto mt-22 grid max-w-310 grid-cols-2 border-border/60 border-y lg:grid-cols-4 dark:border-white/10'>
      {FACTS.map((fact, idx) => (
        <div
          className={cn(
            "flex flex-col gap-1 border-border/60 p-5 sm:p-6 dark:border-white/10",
            // 2×2 on mobile, single row on desktop.
            "even:border-l lg:border-l lg:first:border-l-0",
            idx < 2 && "border-b lg:border-b-0"
          )}
          key={fact.label}
        >
          <dt className='font-mono text-[11px] text-muted-foreground tracking-[0.1em]'>
            {`0${idx + 1}`} · {t(fact.label)}
          </dt>
          <dd className={cn("font-extrabold text-lg sm:text-[22px]", "highlight" in fact && "text-orange-400")}>
            {t(fact.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
