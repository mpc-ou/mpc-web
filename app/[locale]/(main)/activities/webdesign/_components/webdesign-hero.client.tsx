"use client";

import { PageHero } from "@/components/custom/page-hero.client";
import { useTransparentHeader } from "@/hooks/use-transparent-header";

const webDesignCode = `// Creative Frontend & Web Design
import { motion } from "framer-motion";

export const HeroCard = () => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="glassmorphic-card"
  >
    <h3>Creative Frontend</h3>
  </motion.div>
);`;

export function WebDesignHeroClient({ title, subtitle }: { title: string; subtitle: string }) {
  useTransparentHeader({
    hideActions: false,
    textColor: "rgba(255,255,255,0.7)",
    logoColor: "#fff"
  });

  return (
    <PageHero
      badge='FRONTEND CHALLENGE'
      codeSnippet={webDesignCode}
      codeTitle='creative-card.tsx'
      description={subtitle}
      imageUrl='/images/bg/web.png'
      title={title}
    />
  );
}
