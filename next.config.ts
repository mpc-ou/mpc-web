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
        protocol: "https",
        hostname: "api.dicebear.com"
      },
      {
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
      destination: "/en/web-design",
      permanent: true
    },
    {
      source: "/:locale(vi|en)/web-design-exhibition",
      destination: "/:locale/web-design/exhibitions",
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
