import type { ReactNode } from "react";
import {
  getActiveAnnouncement,
  getFooterData,
  getHeaderProfile,
} from "@/app/[locale]/actions";
import { Footer } from "./Footer";
import type { FooterData } from "./Footer";
import { Header } from "./Header";
import type { AnnouncementData } from "./Header/AnnouncementBar.client";
import { UserProfileData } from "./Header/UserProfile.client";

const PageLayout = async ({ children }: { children: ReactNode }) => {
  const [announcementResult, profileResult, footerResult] =
    await Promise.allSettled([
      getActiveAnnouncement(),
      getHeaderProfile(),
      getFooterData(),
    ]);

  for (const result of [announcementResult, profileResult, footerResult]) {
    if (
      result.status === "rejected" &&
      result.reason instanceof Error &&
      result.reason.name === "AbortError"
    ) {
      throw result.reason;
    }
  }

  const announcementRes =
    announcementResult.status === "fulfilled" ? announcementResult.value : null;
  const profileRes =
    profileResult.status === "fulfilled" ? profileResult.value : null;

  const announcementPayload = announcementRes?.data?.payload as
    | { announcement: AnnouncementData | null }
    | undefined;
  const announcement = announcementPayload?.announcement ?? null;

  const profilePayload = profileRes?.data?.payload as
    | UserProfileData
    | undefined;
  const profile: UserProfileData = profilePayload ?? null;

  const footerRes =
    footerResult.status === "fulfilled" ? footerResult.value : null;
  const footerPayload = footerRes?.data?.payload as FooterData | undefined;

  return (
    <>
      <Header announcement={announcement} profile={profile} />
      <main className="flex-1">{children}</main>
      <Footer footerData={footerPayload ?? null} />
    </>
  );
};

export { PageLayout };
