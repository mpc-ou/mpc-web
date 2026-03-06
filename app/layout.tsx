import "@/app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OG_IMAGE, SITE_DESCRIPTION_EN, SITE_NAME, SITE_URL } from "@/constants/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Where there's a bug, there's MPC!`
  },
  description: SITE_DESCRIPTION_EN,
  applicationName: SITE_NAME,
  authors: [{ name: "MPClub Team", url: SITE_URL }],
  category: "Technology",
  creator: "MPClub Team",
  publisher: "MPClub",
  keywords: [
    "MPClub",
    "MPC",
    "HCMOU",
    "OU",
    "Đại học Mở",
    "Trường Đại học Mở TP.HCM",
    "Câu lạc bộ lập trình",
    "Mobile Programming Club",
    "Faculty of Information Technology",
    "Khoa Công nghệ Thông tin",
    "Student Club",
    "web development",
    "programming"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
    alternateLocale: "en_US",
    title: `${SITE_NAME} — Where there's a bug, there's MPC!`,
    description: SITE_DESCRIPTION_EN,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 512,
        height: 512,
        alt: `${SITE_NAME} Logo`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Where there's a bug, there's MPC!`,
    description: SITE_DESCRIPTION_EN,
    images: [OG_IMAGE]
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      vi: `${SITE_URL}/vi`,
      en: `${SITE_URL}/en`
    }
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  }
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}
