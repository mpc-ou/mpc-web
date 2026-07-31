import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ConfettiEffect, FloatingShapes, GridBackground } from "./animations";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const titleLine1 = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const titleLine2 = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }
  }
};

const TRAILING_WHITESPACE_RE = /\s+$/;

export function SlideThankYou({ endImage, year }: { endImage: string | null; year: number }) {
  const t = useTranslations("events");

  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] pt-16'>
      <GridBackground />
      <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
        <div className='absolute top-[-10%] left-[-5%] h-[400px] w-[400px] animate-orb-drift rounded-full bg-cyan-500/10 blur-[120px]' />
        <div
          className='absolute right-[-5%] bottom-[-10%] h-[500px] w-[500px] animate-orb-drift rounded-full bg-orange-500/15 blur-[120px]'
          style={{ animationDelay: "4s" }}
        />
      </div>
      <FloatingShapes />
      <ConfettiEffect />

      {endImage && (
        <div className='absolute inset-0'>
          <Image alt='' className='object-cover opacity-10' fill src={endImage} />
          <div className='absolute inset-0 bg-orange-500/5 mix-blend-overlay' />
        </div>
      )}

      <div className='absolute inset-0 bg-black/30' />
      <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent' />

      <motion.div
        animate='visible'
        className='relative z-10 flex w-full flex-col items-center px-12 text-center'
        initial='hidden'
        variants={containerVariants}
      >
        {/* Year tag */}
        <motion.p
          className='mb-6 font-mono text-cyan-400/70 text-sm uppercase tracking-[0.3em]'
          variants={itemVariants}
        >
          {"// "}
          {year}
        </motion.p>

        {/* Dramatic two-line title */}
        <motion.h2
          className='font-black text-[clamp(64px,12vw,140px)] text-white uppercase leading-[0.85] tracking-tight'
          variants={titleLine1}
        >
          {t("recap.thankYou").split("!")[0].replace(TRAILING_WHITESPACE_RE, "")}
        </motion.h2>
        <motion.h2
          className='mb-8 font-black text-[clamp(64px,12vw,140px)] text-orange-500 uppercase leading-[0.85] tracking-tight'
          style={{
            textShadow: "0 0 40px rgba(249,115,22,0.5), 0 0 80px rgba(249,115,22,0.3)"
          }}
          variants={titleLine2}
        >
          {t("recap.thankYou").includes("!") ? `${t("recap.thankYou").split("!")[1].trim()}!` : "!"}
        </motion.h2>

        {/* Subtitle */}
        <motion.p className='mb-8 max-w-2xl text-[#94a3b8] text-lg leading-relaxed' variants={itemVariants}>
          {t("recap.thankYouMessage", { year })}
        </motion.p>

        {/* Decorative year row */}
        <motion.div className='mb-6 flex items-center gap-6' variants={itemVariants}>
          <span className='h-px w-24 bg-linear-to-r from-transparent to-orange-500/30' />
          <span className='flex items-center gap-3'>
            <Hexagon className='h-4 w-4 text-orange-400/60' />
            <span className='font-mono text-orange-400/70 text-sm uppercase tracking-[0.15em]'>MPC · {year}</span>
            <Hexagon className='h-4 w-4 text-orange-400/60' />
          </span>
          <span className='h-px w-24 bg-linear-to-l from-transparent to-orange-500/30' />
        </motion.div>

        {/* CTA */}
        <motion.p className='font-bold text-orange-400/80 text-sm uppercase tracking-[0.2em]' variants={itemVariants}>
          {t("recap.thankYouCTA")}
        </motion.p>
      </motion.div>
    </div>
  );
}
