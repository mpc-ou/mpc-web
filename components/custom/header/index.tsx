"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useState } from "react";
import { nunito } from "@/configs/fonts";
import { Link } from "@/configs/i18n/routing";
import { useTransparentHeaderState } from "@/hooks/use-transparent-header";
import { cn } from "@/lib/utils";
import type { UserProfileData } from "@/types/common";
import type { AnnouncementData } from "./announcement-bar.client";
import { AnnouncementBar } from "./announcement-bar.client";
import { DesktopNav } from "./desktop-nav.client";
import { LocaleSelect } from "./locale-select.client";
import { MobileMenu } from "./mobile-menu.client";
import { ModeToggle } from "./mode-toggle.client";
import { SearchModal } from "./search-modal.client";
import { UserProfile } from "./user-profile.client";

type HeaderProps = {
  announcement?: AnnouncementData | null;
  profile?: UserProfileData;
  logoUrl?: string;
  siteTitle?: string;
};

const Header = ({ announcement, profile = null, logoUrl, siteTitle }: HeaderProps) => {
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
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 0, 0, 0.2)"
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={cn("top-0 z-40 w-full transition-all duration-300", transparentEnabled ? "fixed" : "sticky")}
      style={rootStyle}
    >
      {!shouldHideAnnouncement && <AnnouncementBar announcement={announcement} />}
      <header
        className={cn(
          "transition-all duration-300",
          isTransparent ? "border-transparent" : "border-border border-b bg-background/95 shadow-sm backdrop-blur"
        )}
        style={isTransparent ? { background: options.bgColor } : undefined}
      >
        <div className={`${nunito.className} container mx-auto flex h-16 items-center justify-between gap-4 px-4`}>
          <Link
            className={cn(
              "group flex items-center gap-2 font-black text-xl tracking-tight transition-all duration-300 hover:scale-105",
              isTransparent
                ? "hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                : "text-primary hover:drop-shadow-[0_0_8px_hsl(22,100%,50%)]"
            )}
            href='/'
            prefetch={true}
            style={isTransparent ? { color: options.logoColor } : undefined}
          >
            <Image
              alt={siteTitle || "MPC Logo"}
              className='h-8 w-8 rounded-full object-cover ring-orange-500/20 transition-shadow duration-300 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.25)] group-hover:ring-orange-500/50'
              height={32}
              src={logoUrl || "/images/logo.png"}
              width={32}
            />
            <span className='transition-colors duration-300 group-hover:text-orange-500'>{siteTitle || "MPClub"}</span>
          </Link>

          <DesktopNav />

          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              isTransparent && options.hideActions && "pointer-events-none opacity-0"
            )}
          >
            <div className='hidden items-center gap-2 md:flex'>
              <LocaleSelect />
              <ModeToggle />
            </div>
            <SearchModal />
            <UserProfile profile={profile} />
            <MobileMenu />
          </div>
        </div>
      </header>
    </div>
  );
};

export { Header };
