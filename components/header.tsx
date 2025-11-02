"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, Menu, X, Moon, Sun, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SITE, PLACEHOLDERS } from "@/lib/constants";
import { HEADER_CONFIG } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    const getResolvedTheme = () => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return theme as "light" | "dark";
    };
    
    setResolvedTheme(getResolvedTheme());
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > HEADER_CONFIG.scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [theme]);

  const navItems = NAV_ITEMS;

  return (
    <header
      className={cn(
        "fixed z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur supports-[backdrop-filter]:bg-[var(--nav-bg-blur)]"
          : "bg-transparent border-none"
      )}
      style={{
        top: "var(--alert-banner-height, 0px)",
      }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={SITE.logo.src}
            alt={SITE.logo.alt}
            width={HEADER_CONFIG.logoSize.width}
            height={HEADER_CONFIG.logoSize.height}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-[var(--primary)]">{SITE.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) =>
            "dropdown" in item ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-sm font-medium transition-colors bg-transparent hover:bg-transparent",
                      isScrolled ? "text-[var(--nav-link)] hover:text-[var(--nav-link-hover)]" : "text-[var(--d-text-primary)] hover:text-[var(--d-text-secondary)]"
                    )}
                  >
                    {item.label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem asChild>
                    <Link href={item.href}>Giới thiệu chung</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {item.dropdown.slice(1).map((subItem) => (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link href={subItem.href}>{subItem.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isScrolled ? "text-[var(--nav-link)] hover:text-[var(--nav-link-hover)]" : "text-[var(--d-text-primary)] hover:text-[var(--d-text-secondary)]"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Search button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={cn(
              "h-9 w-9",
              isScrolled ? "text-[var(--nav-link)] hover:text-[var(--nav-link-hover)]" : "text-[var(--d-text-primary)] hover:text-[var(--d-text-secondary)]"
            )}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Tìm kiếm</span>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const currentResolved = theme === "system"
                ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                : theme;
              setTheme(currentResolved === "dark" ? "light" : "dark");
            }}
            className={cn(
              "h-9 w-9 relative",
              isScrolled ? "text-[var(--nav-link)] hover:text-[var(--nav-link-hover)]" : "text-[var(--d-text-primary)] hover:text-[var(--d-text-secondary)]"
            )}
            suppressHydrationWarning
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Login button */}
          <Link href="/login">
            <Button variant="default" className="hidden sm:inline-flex">
              LOGIN
            </Button>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {isSearchOpen && (
        <div className="border-t border-[var(--nav-border)] bg-[var(--nav-bg)] p-4">
          <div className="container mx-auto">
                  <Input
                    type="search"
                    placeholder={PLACEHOLDERS.search}
                    className="w-full"
                    autoFocus
                  />
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-[var(--nav-border)] bg-[var(--nav-bg)] md:hidden">
          <nav className="container mx-auto flex flex-col space-y-1 p-4">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--nav-item-hover)] rounded-md block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {"dropdown" in item && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.dropdown.map((subItem: { label: string; href: string }) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--nav-item-hover)] rounded-md block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] rounded-md text-center mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              LOGIN
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}