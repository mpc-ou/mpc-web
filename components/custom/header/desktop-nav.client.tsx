"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";

const NavDropdown = ({
  label,
  activePaths,
  children
}: {
  label: string;
  activePaths: string[];
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const pathname = usePathname();

  const active = activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const handleEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setOpen(true);
  }, []);
  const handleLeave = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current as ReturnType<typeof setTimeout>), []);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover-based dropdown support
    // biome-ignore lint/a11y/noStaticElementInteractions: hover-based dropdown support
    <div className='group/dropdown relative' onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        className={cn(
          "relative flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-[15px] text-foreground/70 outline-hidden transition-all duration-200 hover:text-orange-500",
          active && "text-orange-500",
          open && "bg-orange-500/6 text-orange-500"
        )}
        type='button'
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
        <span
          className={cn(
            "absolute bottom-0 left-2.5 h-0.5 rounded-full bg-orange-500 transition-all duration-300 ease-out",
            active ? "right-2.5" : "right-2.5 scale-x-0 group-hover/dropdown:scale-x-100"
          )}
        />
      </button>
      <div
        className={cn(
          "absolute top-full left-0 z-50 mt-1 min-w-44 origin-top overflow-hidden rounded-xl border border-border/80 bg-card/90 py-1 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-200 dark:shadow-[0_10px_35px_rgba(0,0,0,0.8)]",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
};

const NavDropdownItem = ({ href, children }: { href: string; children: ReactNode }) => {
  const pathname = usePathname();
  return (
    <Link
      className={cn(
        "block px-4 py-2 text-[15px] transition-colors hover:bg-orange-500/8 hover:text-orange-500",
        pathname === href && "font-medium text-orange-500"
      )}
      href={href as "/"}
    >
      {children}
    </Link>
  );
};

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      className={cn(
        "group relative rounded-lg px-2.5 py-1.5 font-medium text-[15px] text-foreground/70 transition-colors duration-200 hover:text-orange-500",
        active && "text-orange-500"
      )}
      href={href as "/"}
    >
      {label}
      <span
        className={cn(
          "absolute bottom-0 left-2.5 h-0.5 rounded-full bg-orange-500 transition-all duration-300 ease-out",
          active ? "right-2.5" : "right-2.5 scale-x-0 group-hover:scale-x-100"
        )}
      />
    </Link>
  );
};

const DropdownDivider = () => <div className='mx-3 my-1 border-border border-t' />;

const DesktopNav = () => {
  const t = useTranslations("header.nav");
  const nav = (key: string) => t(key as never);

  return (
    <nav className='hidden items-center gap-0.5 md:flex'>
      <NavDropdown activePaths={["/blogs", "/events"]} label={nav("news")}>
        <NavDropdownItem href='/blogs'>{nav("blogs")}</NavDropdownItem>
        <NavDropdownItem href='/events'>{nav("events")}</NavDropdownItem>
      </NavDropdown>

      <NavLink href='/achievements' label={nav("achievements")} />
      <NavLink href='/projects' label={nav("projects")} />

      <NavLink href='/training' label={nav("training")} />

      <NavDropdown activePaths={["/about", "/activities", "/members", "/recap"]} label={nav("about")}>
        <NavDropdownItem href='/about'>{nav("introduction")}</NavDropdownItem>
        <NavDropdownItem href='/activities'>{nav("activities")}</NavDropdownItem>
        <NavDropdownItem href='/members'>{nav("members")}</NavDropdownItem>
        <DropdownDivider />
        <NavDropdownItem href='/activities/webdesign'>{nav("webdesign")}</NavDropdownItem>
        {/* <DropdownDivider />
        <NavDropdownItem href="/recap">{nav("recap")}</NavDropdownItem> */}
      </NavDropdown>
    </nav>
  );
};

export { DesktopNav };
