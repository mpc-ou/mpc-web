"use client";

import { LogOut, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

type AdminHeaderProps = {
  memberName: string;
  memberAvatar: string | null;
  memberRole: string;
};

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
  "/admin/settings": "Cài đặt",
};

export function AdminHeader({
  memberName,
  memberAvatar,
  memberRole,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/^\/[a-z]{2}/, "");

  const currentPage = Object.entries(breadcrumbMap)
    .filter(([key]) => normalizedPath.startsWith(key))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return (
    <header className="flex h-14 items-center justify-between border-border border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Link className="flex items-center gap-2" href={"/admin" as "/"}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm">
            M
          </div>
          <span className="font-bold text-foreground text-sm">MPC Admin</span>
        </Link>
        {currentPage && currentPage[0] !== "/admin" && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground text-sm">
              {currentPage[1]}
            </span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          className="text-muted-foreground text-xs hover:text-foreground"
          href={"/" as "/"}
        >
          <PanelLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={memberAvatar ?? undefined} />
            <AvatarFallback className="bg-primary/10 font-bold text-primary text-[10px]">
              {memberName
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-foreground">{memberName}</p>
            <p className="text-xs text-muted-foreground">{memberRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
