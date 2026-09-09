"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/configs/i18n/routing";
import { cn } from "@/lib/utils";
import { LocaleSelect } from "./locale-select.client";
import { ModeToggle } from "./mode-toggle.client";

type NavLink = { href: string; label: string };
type NavGroup = { label: string; children: NavLink[] };
type NavItem = NavLink | NavGroup;
const isGroup = (item: NavItem): item is NavGroup => "children" in item;

const MobileMenu = () => {
  const t = useTranslations("header");
  const tNav = useTranslations("header.nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const closeMenu = () => {
    setOpen(false);
    setExpandedGroups(new Set());
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navItems: NavItem[] = [
    { label: tNav("home"), href: "/" },
    { label: tNav("activities"), href: "/activities" },
    {
      label: tNav("news"),
      children: [
        { label: tNav("blogs"), href: "/blogs" },
        { label: tNav("events"), href: "/events" }
      ]
    },
    { label: tNav("achievements"), href: "/achievements" },
    { label: tNav("projects"), href: "/projects" },
    {
      label: tNav("about"),
      children: [
        { label: tNav("introduction"), href: "/about" },
        { label: tNav("members"), href: "/members" },
        { label: tNav("webdesign"), href: "/activities/webdesign" }
        // { label: tNav("recap"), href: "/recap" },
      ]
    },
    { label: tNav("training"), href: "/training" }
  ];

  const sidebar = (
    <>
      {open && (
        <button
          aria-label={t("closeMenu")}
          className='fixed inset-0 z-48 cursor-default bg-black/40 md:hidden'
          onClick={closeMenu}
          type='button'
        />
      )}

      <div
        className={cn(
          "fixed top-0 right-0 z-49 flex h-full w-72 flex-col bg-background shadow-xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className='flex items-center justify-between border-border border-b px-4 py-3.5'>
          <span className='font-black text-lg text-orange-500 tracking-tight'>MPC</span>
          <button
            aria-label={t("closeMenu")}
            className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            onClick={closeMenu}
            type='button'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <nav className='flex flex-col overflow-y-auto py-2'>
          {navItems.map((item) =>
            isGroup(item) ? (
              <div key={item.label}>
                <button
                  className='flex w-full items-center justify-between px-4 py-2.5 font-medium text-foreground/80 text-sm transition-colors hover:bg-orange-500/5 hover:text-orange-500'
                  onClick={() => toggleGroup(item.label)}
                  type='button'
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      expandedGroups.has(item.label) && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "ml-6 overflow-hidden border-orange-500/10 border-l-2 transition-all duration-200",
                    expandedGroups.has(item.label) ? "max-h-64 opacity-100" : "max-h-0 border-transparent opacity-0"
                  )}
                >
                  {item.children.map((child) => (
                    <Link
                      className={cn(
                        "block px-4 py-2 text-sm transition-colors hover:text-orange-500",
                        isActive(child.href) ? "font-medium text-orange-500" : "text-muted-foreground"
                      )}
                      href={child.href as "/"}
                      key={child.href}
                      onClick={closeMenu}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                className={cn(
                  "px-4 py-2.5 font-medium text-sm transition-colors hover:bg-orange-500/5 hover:text-orange-500",
                  isActive(item.href) ? "bg-orange-500/5 text-orange-500" : "text-foreground/80"
                )}
                href={item.href as "/"}
                key={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className='mt-auto flex items-center justify-between border-border border-t p-4'>
          <LocaleSelect />
          <ModeToggle />
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className='flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden'
        onClick={() => setOpen((o) => !o)}
        type='button'
      >
        {open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      </button>
      {mounted && createPortal(sidebar, document.body)}
    </>
  );
};

export { MobileMenu };
