"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/configs/i18n/routing";
import { LocaleSelect } from "./LocaleSelect.client";
import { ModeToggle } from "./ModeToggle.client";

type NavLink = {
  href: string;
  label: string;
};

type NavGroup = {
  children: NavLink[];
  label: string;
};

type NavItem = NavLink | NavGroup;

const isGroup = (item: NavItem): item is NavGroup => "children" in item;

const MobileMenu = () => {
  const t = useTranslations("header");
  const tNav = useTranslations("header.nav");
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const navItems: NavItem[] = [
    { label: tNav("home"), href: "/" },
    { label: tNav("training"), href: "/training" },
    {
      label: tNav("activities"),
      children: [
        { label: tNav("introduction"), href: "/activities" },
        { label: tNav("events"), href: "/events" },
        { label: tNav("webDesign"), href: "/activities/webdesign" }
      ]
    },
    { label: tNav("achievements"), href: "/achievements" },
    { label: tNav("sponsors"), href: "/sponsors" },
    {
      label: tNav("about"),
      children: [
        { label: tNav("about"), href: "/about" },
        { label: tNav("members"), href: "/members" },
        { label: tNav("projects"), href: "/projects" },
        { label: tNav("recap"), href: "/recap" }
      ]
    }
  ];

  const closeMenu = () => {
    setOpen(false);
    setExpandedGroups(new Set());
  };

  const portalContent = (
    <>
      {}
      {open && (
        <button
          aria-label={t("closeMenu")}
          className='fixed inset-0 z-[48] cursor-default bg-black/40 md:hidden'
          onClick={closeMenu}
          type='button'
        />
      )}

      {}
      <div
        className={`fixed top-0 right-0 z-[49] flex h-full w-72 flex-col bg-background shadow-xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className='flex items-center justify-between border-border border-b px-4 py-4'>
          <span className='font-bold text-lg text-primary'>MPC</span>
          <button
            aria-label={t("closeMenu")}
            className='rounded-md p-1 hover:bg-muted'
            onClick={closeMenu}
            type='button'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        <nav className='flex flex-col overflow-y-auto py-4'>
          {navItems.map((item) =>
            isGroup(item) ? (
              <div key={item.label}>
                <button
                  className='flex w-full items-center justify-between px-4 py-3 font-medium text-foreground/80 text-sm transition-colors hover:bg-muted hover:text-primary'
                  onClick={() => toggleGroup(item.label)}
                  type='button'
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedGroups.has(item.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    expandedGroups.has(item.label) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      className='block px-8 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-primary'
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
                className='px-4 py-3 font-medium text-foreground/80 text-sm transition-colors hover:bg-muted hover:text-primary'
                href={item.href as "/"}
                key={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Footer Actions */}
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
        className='flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground/80 transition-colors hover:bg-muted md:hidden'
        onClick={() => setOpen((o) => !o)}
        type='button'
      >
        {open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      </button>

      {mounted && createPortal(portalContent, document.body)}
    </>
  );
};

export { MobileMenu };
