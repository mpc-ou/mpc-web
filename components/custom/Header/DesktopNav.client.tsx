"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Link } from "@/configs/i18n/routing";

const DesktopNav = () => {
  const tNav = useTranslations("header.nav");

  const linkClass =
    "rounded-md px-3 py-2 font-semibold text-md text-foreground/80 transition-colors hover:text-primary";

  return (
    <nav className='hidden items-center gap-1 md:flex'>
      <Link className={linkClass} href='/training'>
        {tNav("training")}
      </Link>

      {/* Activities Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center gap-1 ${linkClass}`} type='button'>
            {tNav("activities")}
            <ChevronDown className='h-4 w-4 transition-transform duration-200' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem asChild>
            <Link href='/activities'>{tNav("introduction")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/events'>{tNav("events")}</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href='/activities/webdesign'>{tNav("webDesign")}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link className={linkClass} href='/achievements'>
        {tNav("achievements")}
      </Link>
      {/* <Link className={linkClass} href="/sponsors">
        {tNav("sponsors")}
      </Link> */}

      {/* About Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`flex items-center gap-1 ${linkClass}`} type='button'>
            {tNav("about")}
            <ChevronDown className='h-4 w-4 transition-transform duration-200' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem asChild>
            <Link href='/about'>{tNav("about")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/members'>{tNav("members")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/projects'>{tNav("projects")}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export { DesktopNav };
