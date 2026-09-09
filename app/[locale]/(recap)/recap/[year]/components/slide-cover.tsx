import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FloatingShapes, GlowingOrbs, GridBackground, ScanningLine } from "./animations";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const titleVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const yearVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function SlideCover({ coverImage, name, year }: { coverImage: string | null; name: string; year: number }) {
  const t = useTranslations("events");

  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] pt-16'>
      <GridBackground />
      <GlowingOrbs />
      <ScanningLine />
      <FloatingShapes />

      {coverImage && (
        <div className='absolute inset-0'>
          <Image alt='' className='object-cover opacity-10' fill priority src={coverImage} />
          <div className='absolute inset-0 bg-orange-600/5 mix-blend-overlay' />
        </div>
      )}

      <div className='absolute inset-0 bg-black/30' />
      <div className='absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60' />

      {/* Club badge — top-left */}
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className='absolute top-24 left-8 z-10 flex items-center gap-3 md:left-12'
        initial={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20'>
          <Hexagon className='h-4 w-4 text-orange-400' />
        </div>
        <span className='font-mono text-[13px] text-white/50 uppercase tracking-[0.3em]'>MPC</span>
      </motion.div>

      <motion.div
        animate='visible'
        className='relative z-10 flex w-full flex-col items-center px-12 text-center'
        initial='hidden'
        variants={containerVariants}
      >
        {/* Tagline */}
        <motion.p
          className='mb-8 font-mono text-base text-orange-400/80 uppercase tracking-[0.3em]'
          variants={itemVariants}
        >
          {t("recap.slideshow")}
        </motion.p>

        {/* Main title */}
        <motion.h1
          className='mb-8 w-full max-w-[90vw] font-black text-[clamp(64px,10vw,128px)] text-white uppercase leading-[0.85] tracking-tight'
          style={{
            textShadow: "0 0 40px rgba(249,115,22,0.4), 0 0 80px rgba(249,115,22,0.2)"
          }}
          variants={titleVariants}
        >
          {name || "YEAR RECAP"}
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          className='mb-8 h-[2px] w-48 bg-linear-to-r from-transparent via-orange-500 to-transparent'
          variants={itemVariants}
        />

        {/* Year badge */}
        <motion.div
          className='relative flex items-center gap-6 rounded-full border border-orange-500/25 bg-orange-500/8 px-10 py-4'
          variants={yearVariants}
        >
          <span className='h-px w-8 bg-orange-500/40' />
          <span className='font-mono text-3xl text-orange-300 tracking-[0.15em] sm:text-4xl'>
            {year - 1} — {year}
          </span>
          <span className='h-px w-8 bg-orange-500/40' />
        </motion.div>
      </motion.div>
    </div>
  );
}
