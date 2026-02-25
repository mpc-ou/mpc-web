import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

/**
 * Generate a DiceBear avataaars avatar URL (as a data URI).
 * Uses the given seed (typically the member's email).
 */
export function generateDiceBearAvataUrl(seed: string): string {
  const avatar = createAvatar(avataaars, {
    seed,
    // Consistent background for all profiles
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
    backgroundType: ["solid"],
    radius: 50,
  });
  return avatar.toDataUri();
}

/**
 * Generate a DiceBear formatted URL for <img> src (SVG data URI).
 * Suitable for embedding directly in <img src="..."/>.
 */
export function getDiceBearUrl(seed: string): string {
  // Use the official DiceBear CDN URL format for production use
  const seedEncoded = encodeURIComponent(seed);
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seedEncoded}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid&radius=50`;
}
