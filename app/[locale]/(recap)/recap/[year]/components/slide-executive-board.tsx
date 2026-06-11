import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { RecapData } from "@/lib/recap-data";
import { getFullName } from "@/lib/utils";
import { colorFromString, dimColorFromString } from "@/utils/color";
import { GlowingOrbs, GridBackground } from "./animations";

const isPresident = (pos: string) =>
  pos === "PRESIDENT" || pos.toLowerCase().includes("president") || pos.toLowerCase().includes("chủ nhiệm");

export function SlideExecutiveBoard({ members }: { members: RecapData["executiveBoard"] }) {
  const t = useTranslations("events");
  const locale = useLocale() as "vi" | "en";

  const sorted = [...members].sort((a) => (isPresident(a.position) ? -1 : 1));

  return (
    <div className='custom-scrollbar relative flex h-full w-full flex-col overflow-y-auto bg-[#0a0a0f] pt-16'>
      <GridBackground />
      <GlowingOrbs />
      <div className='absolute inset-0 min-h-full bg-linear-to-br from-orange-500/[0.04] via-transparent to-black/30' />

      <div className='relative z-10 mx-auto flex h-full min-h-max w-full flex-col px-10 pb-20'>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='mb-10 shrink-0 text-center'
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className='mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 px-5 py-2 text-orange-300'>
            <Trophy className='h-5 w-5' />
            <span className='font-semibold text-sm uppercase tracking-[0.12em]'>{t("recap.executiveBoardTitle")}</span>
          </div>
          <h2 className='font-black text-5xl text-white tracking-tight sm:text-7xl'>
            {t("recap.executiveBoardTitle")}
          </h2>
          <p className='mx-auto mt-3 max-w-2xl text-[#94a3b8] text-base'>
            {locale === "en"
              ? "The core individuals who led and grew the club during this term."
              : "Những cá nhân nòng cốt đã điều hành và phát triển CLB trong nhiệm kỳ."}
          </p>
        </motion.div>

        <div className='flex flex-1 items-start justify-center'>
          <motion.div
            animate='visible'
            className='flex flex-wrap justify-center gap-6 pb-16'
            initial='hidden'
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.2 }
              }
            }}
          >
            {sorted.map((m) => {
              const fullName = getFullName(m.firstName, m.lastName, "vi");
              const borderColor = colorFromString(fullName);
              const bgColor = dimColorFromString(fullName);
              const displayPos = locale === "en" && m.positionEn ? m.positionEn : m.position;
              const displayDep = locale === "en" && m.departmentEn ? m.departmentEn : m.department;
              const pres = isPresident(m.position);

              return (
                <motion.div
                  className={`group flex flex-col items-center gap-4 rounded-2xl border bg-[#13131f] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-[0_10px_24px_rgba(245,158,11,0.12)] ${
                    pres ? "w-64 border-amber-500/30 sm:w-72" : "w-56 border-white/6 sm:w-60"
                  }`}
                  key={m.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }
                    }
                  }}
                >
                  {m.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={fullName}
                      className={`rounded-full object-cover ring-2 ring-white/10 transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(245,158,11,0.2)] group-hover:ring-amber-400 ${
                        pres ? "h-24 w-24" : "h-20 w-20"
                      }`}
                      src={m.avatar}
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center rounded-full font-bold transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(245,158,11,0.2)] group-hover:ring-2 group-hover:ring-amber-400 ${
                        pres ? "h-24 w-24 text-2xl" : "h-20 w-20 text-xl"
                      }`}
                      style={{
                        backgroundColor: bgColor,
                        color: borderColor,
                        border: `2.5px solid ${borderColor}`
                      }}
                    >
                      {m.firstName[0]}
                    </div>
                  )}
                  <div className='mt-1 w-full overflow-hidden text-center'>
                    <div
                      className={`w-full truncate font-semibold text-white/95 transition-colors group-hover:text-white ${
                        pres ? "text-lg" : "text-base"
                      }`}
                      title={fullName}
                    >
                      {fullName}
                    </div>
                    <div
                      className={`mt-1.5 w-full truncate font-bold text-amber-400/80 uppercase tracking-[0.08em] transition-colors group-hover:text-amber-300 ${
                        pres ? "text-sm" : "text-xs"
                      }`}
                      title={displayPos}
                    >
                      {displayPos}
                    </div>
                    {displayDep && (
                      <div
                        className='mt-1 w-full truncate font-medium text-white/30 text-xs uppercase tracking-[0.06em]'
                        title={displayDep}
                      >
                        {displayDep}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
