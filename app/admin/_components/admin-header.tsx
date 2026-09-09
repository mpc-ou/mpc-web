"use client";

import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AdminModeToggle } from "./mode-toggle";

type AdminHeaderProps = {
  memberName: string;
  memberAvatar: string | null;
  memberRole: string;
  logoUrl?: string;
  onToggleSidebar?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/members": "Members",
  "/admin/announcements": "Announcements",
  "/admin/posts": "Content",
  "/admin/projects": "Projects",
  "/admin/activities": "Activities",
  "/admin/recaps": "Recaps",
  "/admin/faq": "FAQ",
  "/admin/gallery": "Gallery",
  "/admin/homepage": "Homepage",
  "/admin/sponsors": "Sponsors",
  "/admin/departments": "Departments",
  "/admin/site-config": "Site Config",
  "/admin/settings": "Settings"
};

export function AdminHeader({
  memberName,
  memberAvatar,
  memberRole,
  logoUrl,
  onToggleSidebar,
  collapsed = false,
  onToggleCollapsed
}: AdminHeaderProps) {
  const pathname = usePathname();

  const currentPage = Object.entries(breadcrumbMap)
    .filter(([key]) => pathname.startsWith(key))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return (
    <header className='flex h-14 shrink-0 items-center justify-between border-border border-b bg-background px-4 md:px-6'>
      <div className='flex items-center gap-3'>
        {/* Mobile menu trigger */}
        <Button
          className='h-9 w-9 cursor-pointer text-muted-foreground hover:text-foreground lg:hidden'
          onClick={onToggleSidebar}
          size='icon'
          variant='ghost'
        >
          <Menu className='h-5 w-5' />
        </Button>

        {/* Desktop sidebar collapse trigger */}
        <Button
          className='hidden h-9 w-9 cursor-pointer text-muted-foreground hover:text-foreground lg:flex'
          onClick={onToggleCollapsed}
          size='icon'
          variant='ghost'
        >
          {collapsed ? <ChevronsRight className='h-4 w-4' /> : <ChevronsLeft className='h-4 w-4' />}
        </Button>

        <Link className='flex items-center gap-2' href='/admin'>
          <Image
            alt='MPC Logo'
            className='h-8 w-8 rounded-full object-cover ring-orange-500/20'
            height={32}
            src={logoUrl || "/images/logo.png"}
            width={32}
          />
          <span className='hidden font-bold text-foreground text-sm sm:inline'>MPC Admin</span>
        </Link>
        {currentPage && currentPage[0] !== "/admin" && (
          <>
            <span className='text-muted-foreground'>/</span>
            <span className='font-medium text-foreground text-sm'>{currentPage[1]}</span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className='flex items-center gap-4'>
        <div className='flex scale-90 items-center gap-2'>
          <AdminModeToggle />
        </div>
        <Link className='text-muted-foreground text-xs hover:text-foreground' href='/'>
          Site
        </Link>
        <div className='flex items-center gap-2'>
          <Avatar className='h-7 w-7'>
            <AvatarImage src={memberAvatar ?? undefined} />
            <AvatarFallback className='bg-primary/10 font-bold text-[10px] text-primary'>
              {memberName
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className='hidden sm:block'>
            <p className='font-medium text-foreground text-xs'>{memberName}</p>
            <p className='text-muted-foreground text-xs'>{memberRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
