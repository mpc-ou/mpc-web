"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/configs/i18n/routing";

const MobileMenu = () => {
  const t = useTranslations("header");
  const tNav = useTranslations("header.nav");
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: tNav("home"), href: "/" },
    { label: tNav("training"), href: "/training" },
    { label: tNav("activities"), href: "/activities" },
    { label: tNav("webDesign"), href: "/activities/web-design", indent: true },
    { label: tNav("recruitment"), href: "/activities/recruitment", indent: true },
    { label: tNav("events"), href: "/activities/events", indent: true },
    { label: tNav("achievements"), href: "/achievements" },
    { label: tNav("about"), href: "/about" }
  ];

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

      {/* Overlay */}
      {open && (
        <button
          aria-label={t("closeMenu")}
          className='fixed inset-0 z-40 cursor-default bg-black/40 md:hidden'
          onClick={() => setOpen(false)}
          type='button'
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-background shadow-xl transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className='flex items-center justify-between border-border border-b px-4 py-4'>
          <span className='font-bold text-lg text-primary'>MPC</span>
          <button
            aria-label={t("closeMenu")}
            className='rounded-md p-1 hover:bg-muted'
            onClick={() => setOpen(false)}
            type='button'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        <nav className='flex flex-col overflow-y-auto py-4'>
          {navItems.map((item) => (
            <Link
              className={`px-${item.indent ? "8" : "4"} py-3 text-sm font-${item.indent ? "normal" : "medium"} text-foreground/80 transition-colors hover:bg-muted hover:text-primary ${item.indent ? "text-muted-foreground" : ""}`}
              href={item.href as "/"}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.indent && <span className='mr-1 text-muted-foreground'>└</span>}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export { MobileMenu };
