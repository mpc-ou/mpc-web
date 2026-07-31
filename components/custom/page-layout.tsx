import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { getActiveAnnouncement, getFooterData, getHeaderProfile, getSiteSettings } from "@/app/_actions/main";
import { BackToTop } from "@/components/custom/back-to-top.client";
import type { FooterData } from "@/components/custom/footer";
import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";
import type { AnnouncementData } from "@/components/custom/header/announcement-bar.client";
import type { UserProfileData } from "@/types/common";

const PageLayout = async ({ children }: { children: ReactNode }) => {
  await cookies();

  const [announcementResult, profileResult, footerResult, brandingResult] = await Promise.allSettled([
    getActiveAnnouncement(),
    getHeaderProfile(),
    getFooterData(),
    getSiteSettings(["site_title", "site_logo", "site_primary_color"])
  ]);

  for (const result of [announcementResult, profileResult, footerResult]) {
    if (result.status === "rejected" && result.reason instanceof Error && result.reason.name === "AbortError") {
      throw result.reason;
    }
  }

  const announcementRes = announcementResult.status === "fulfilled" ? announcementResult.value : null;
  const profileRes = profileResult.status === "fulfilled" ? profileResult.value : null;

  const announcementPayload = announcementRes?.data?.payload as { announcement: AnnouncementData | null } | undefined;
  const announcement = announcementPayload?.announcement ?? null;

  const profilePayload = profileRes?.data?.payload as UserProfileData | undefined;
  const profile: UserProfileData = profilePayload ?? null;

  const footerRes = footerResult.status === "fulfilled" ? footerResult.value : null;
  const footerPayload = footerRes?.data?.payload as FooterData | undefined;

  const brandingRes = brandingResult.status === "fulfilled" ? brandingResult.value : null;
  const brandingMap = (brandingRes?.data?.payload as Record<string, string>) ?? {};

  return (
    <>
      <Header
        announcement={announcement}
        logoUrl={brandingMap.site_logo}
        profile={profile}
        siteTitle={brandingMap.site_title}
      />
      <main className='flex-1'>{children}</main>
      <Footer footerData={footerPayload ?? null} />
      <BackToTop />
    </>
  );
};

export { PageLayout };
