"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/configs/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DesktopNav = () => {
  const tNav = useTranslations("header.nav");

  const linkClass =
    "rounded-md px-3 py-2 font-semibold text-md text-foreground/80 transition-colors hover:text-primary";

  return (
    <nav className="hidden items-center gap-1 md:flex">
      <Link className={linkClass} href="/training">
        {tNav("training")}
      </Link>

      {/* Activities Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-1 ${linkClass}`}
            type="button"
          >
            {tNav("activities")}
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <Link href="/activities/web-design">{tNav("webDesign")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/activities/recruitment">{tNav("recruitment")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/activities/events">{tNav("events")}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link className={linkClass} href="/achievements">
        {tNav("achievements")}
      </Link>
      <Link className={linkClass} href="/about">
        {tNav("about")}
      </Link>
    </nav>
  );
};

export { DesktopNav };
