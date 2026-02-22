"use client";

import { Search } from "lucide-react";
import { Suspense } from "react";
import { Link } from "@/configs/i18n/routing";
import { nunito } from "@/configs/fonts";
import type { AnnouncementData } from "./AnnouncementBar.client";
import { AnnouncementBar } from "./AnnouncementBar.client";
import { DesktopNav } from "./DesktopNav.client";
import { LocaleSelect } from "./LocaleSelect.client";
import { MobileMenu } from "./MobileMenu.client";
import { ModeToggle } from "./ModeToggle.client";
import type { UserProfileData } from "@/types/common";
import { UserProfile } from "./UserProfile.client";

type HeaderProps = {
  announcement?: AnnouncementData | null;
  profile?: UserProfileData;
};

const Header = ({ announcement, profile = null }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-40 w-full">
      <AnnouncementBar announcement={announcement} />
      <header className="border-b border-border bg-background/95 shadow-sm backdrop-blur">
        <div
          className={`${nunito.className} container mx-auto flex h-16 items-center justify-between gap-4 px-4`}
        >
          {/* Left: Logo */}
          <Link
            className="group flex items-center gap-2 font-black text-xl tracking-tight text-primary transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_8px_hsl(25,95%,53%)]"
            href="/"
            prefetch={true}
          >
            <img
              className="h-8 w-8 rounded-lg"
              src="/images/logo.png"
              alt="MPC Logo"
            />
            <span>MPClub</span>
          </Link>

          {/* Center: Desktop Nav */}
          <DesktopNav />

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <LocaleSelect />
            <ModeToggle />
            <div className="hidden md:block">
              <UserProfile profile={profile} />
            </div>
            <MobileMenu />
          </div>
        </div>
      </header>
    </div>
  );
};

export { Header };
