import { readdirSync } from "node:fs";
import path from "node:path";

const HERO_DIR = "images/hero-section";
const IMAGE_RE = /\.(jpe?g|png|webp|avif)$/i;

export function getHeroSlides(): string[] {
  try {
    return readdirSync(path.join(process.cwd(), "public", HERO_DIR))
      .filter((f) => IMAGE_RE.test(f))
      .sort()
      .map((f) => `/${HERO_DIR}/${f}`);
  } catch {
    return [];
  }
}
