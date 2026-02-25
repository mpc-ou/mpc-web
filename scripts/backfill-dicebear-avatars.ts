/**
 * Backfill DiceBear Avataaars avatars for members who don't have an avatar.
 * Run with: npx ts-node --project tsconfig.json scripts/backfill-dicebear-avatars.ts
 * Or: pnpm tsx scripts/backfill-dicebear-avatars.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../configs/prisma/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  max: 2
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function getDiceBearUrl(seed: string): string {
  const seedEncoded = encodeURIComponent(seed);
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seedEncoded}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid&radius=50`;
}

async function main() {
  console.log("🔍 Finding members without avatars...");

  const members = await prisma.member.findMany({
    where: { avatar: null },
    select: { id: true, email: true, firstName: true, lastName: true }
  });

  if (members.length === 0) {
    console.log("✅ All members already have avatars!");
    return;
  }

  console.log(`📝 Found ${members.length} members without avatars. Updating...`);

  let updated = 0;
  let failed = 0;

  for (const member of members) {
    try {
      const avatarUrl = getDiceBearUrl(member.email);
      await prisma.member.update({
        where: { id: member.id },
        data: { avatar: avatarUrl }
      });
      console.log(`  ✓ ${member.firstName} ${member.lastName} (${member.email})`);
      updated++;
    } catch (err) {
      console.error(`  ✗ Failed for ${member.email}:`, err);
      failed++;
    }
  }

  console.log(`\n🎉 Done! Updated: ${updated}, Failed: ${failed}`);
}

main()
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
