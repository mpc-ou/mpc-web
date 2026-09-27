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
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "placehold.co"
      }
    ],
    dangerouslyAllowSVG: true,
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  redirects: async () => [
    {
      source: "/:locale(vi|en)/activities/webdesign",
      destination: "/:locale/web-design",
      permanent: true
    },
    {
      source: "/activities/webdesign",
      destination: "/web-design",
      permanent: true
    }
  ],
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
