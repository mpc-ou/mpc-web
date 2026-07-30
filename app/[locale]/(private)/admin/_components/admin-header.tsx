"use client";

import { LogOut, Menu, PanelLeft } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LocaleSelect } from "@/components/custom/header/locale-select.client";
import { ModeToggle } from "@/components/custom/header/mode-toggle.client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

type AdminHeaderProps = {
  memberName: string;
  memberAvatar: string | null;
  memberRole: string;
  logoUrl?: string;
  onToggleSidebar?: () => void;
};

const LOCALE_PREFIX_RE = /^\/[a-z]{2}/;

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/members": "Thành viên",
  "/admin/announcements": "Thông báo",
  "/admin/events": "Sự kiện",
  "/admin/posts": "Bài viết",
  "/admin/achievements": "Thành tựu",
  "/admin/projects": "Dự án",
  "/admin/faq": "FAQ",
  "/admin/gallery": "Gallery",
  "/admin/homepage": "Homepage",
  "/admin/sponsors": "Nhà tài trợ",
  "/admin/departments": "Ban/Phòng",
  "/admin/settings": "Cài đặt"
};

export function AdminHeader({ memberName, memberAvatar, memberRole, logoUrl, onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(LOCALE_PREFIX_RE, "");

  const currentPage = Object.entries(breadcrumbMap)
    .filter(([key]) => normalizedPath.startsWith(key))
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

        <Link className='flex items-center gap-2' href={"/admin" as "/"}>
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
          <LocaleSelect />
          <ModeToggle />
        </div>
        <Link className='text-muted-foreground text-xs hover:text-foreground' href={"/" as const}>
          <PanelLeft className='h-4 w-4' />
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
