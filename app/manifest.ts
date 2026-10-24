import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION_VI, SITE_NAME } from "@/constants/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} – Mobile Programming Club`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION_VI,
    start_url: "/en",
    display: "standalone",
    background_color: "#0b1324",
    theme_color: "#f97316",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon"
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
