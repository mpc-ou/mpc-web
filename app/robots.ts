import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/profile/",
          "/auth/",
          "/member-card/",
          "/my-blogs/",
          "/api-docs/",
          "/*/auth/",
          "/*/admin/",
          "/*/profile/",
          "/*/member-card/",
          "/*/my-blogs/"
        ]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
