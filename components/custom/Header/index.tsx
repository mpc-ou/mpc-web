"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { nunito } from "@/configs/fonts";
import { Link } from "@/configs/i18n/routing";
import { useTransparentHeaderState } from "@/hooks/use-transparent-header";
import { cn } from "@/lib/utils";
import type { UserProfileData } from "@/types/common";
import type { AnnouncementData } from "./AnnouncementBar.client";
import { AnnouncementBar } from "./AnnouncementBar.client";
import { DesktopNav } from "./DesktopNav.client";
import { LocaleSelect } from "./LocaleSelect.client";
import { MobileMenu } from "./MobileMenu.client";
import { ModeToggle } from "./ModeToggle.client";
import { UserProfile } from "./UserProfile.client";

type HeaderProps = {
  announcement?: AnnouncementData | null;
  profile?: UserProfileData;
};

const Header = ({ announcement, profile = null }: HeaderProps) => {
  const { enabled: transparentEnabled, options } = useTransparentHeaderState();
  const [scrolled, setScrolled] = useState(!transparentEnabled);

  useEffect(() => {
    if (!transparentEnabled) {
      setScrolled(true);
      return;
    }

    const threshold = options.scrollThreshold;
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparentEnabled, options.scrollThreshold]);

  const isTransparent = transparentEnabled && !scrolled;
  const shouldHideAnnouncement = isTransparent && options.hideAnnouncement;

  const rootStyle: CSSProperties | undefined = isTransparent
    ? ({
        "--color-foreground": options.textColor,
        "--color-muted-foreground": options.textColor,
        "--color-border": "transparent",
        "--color-input": "transparent",
        "--color-background": options.bgColor,
        "--color-accent": "rgba(255,255,255,0.1)",
        "--color-accent-foreground": options.textColor,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={cn(
        "top-0 z-40 w-full transition-all duration-300",
        transparentEnabled ? "fixed" : "sticky",
      )}
      style={rootStyle}
    >
      {!shouldHideAnnouncement && (
        <AnnouncementBar announcement={announcement} />
      )}
      <header
        className={cn(
          "transition-all duration-300",
          isTransparent
            ? "border-transparent"
            : "border-border border-b bg-background/95 shadow-sm backdrop-blur",
        )}
        style={isTransparent ? { background: options.bgColor } : undefined}
      >
        <div
          className={`${nunito.className} container mx-auto flex h-16 items-center justify-between gap-4 px-4`}
        >
          {/* Left: Logo */}
          <Link
            className={cn(
              "group flex items-center gap-2 font-black text-xl tracking-tight transition-all duration-300 hover:scale-105",
              isTransparent
                ? "hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                : "text-primary hover:drop-shadow-[0_0_8px_hsl(25,95%,53%)]",
            )}
            href="/"
            prefetch={true}
            style={isTransparent ? { color: options.logoColor } : undefined}
          >
            <img
              alt="MPC Logo"
              className="h-8 w-8 rounded-lg"
              src="/images/logo.png"
            />
            <span>MPClub</span>
          </Link>

          {/* Center: Desktop Nav */}
          <DesktopNav />

          {/* Right: Actions */}
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              isTransparent &&
                options.hideActions &&
                "pointer-events-none opacity-0",
            )}
          >
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
