import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./configs/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tsqyqazktzyicxccdpfy.supabase.co"
      },
      {
        // Fallback avatar generator (see utils/dicebear-avatar.ts), serves SVG
        protocol: "https",
        hostname: "api.dicebear.com"
      },
      {
        // Live website screenshot service used for webdesign contest thumbnails
        // (see configs/data/wd.json)
        protocol: "https",
        hostname: "image.thum.io"
      }
    ],
    // DiceBear avatars are served as SVG; sandboxed per Next.js docs since
    // remote SVGs can otherwise carry inline scripts.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  cacheComponents: true,
  reactCompiler: true,
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [".next/export-detail.json"],
    "/api/docs": ["./.next/cache/**/*"]
  },
  webpack: (config, { dev }) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({ type: "memory" });
    }
    return config;
  }
};

export default withNextIntl(nextConfig);
