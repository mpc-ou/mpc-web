"use client";

import {
  Building2,
  Calendar,
  FileText,
  FolderGit2,
  Heart,
  HelpCircle,
  Home,
  Image,
  LayoutDashboard,
  Megaphone,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/configs/i18n/routing";

type SidebarProps = {
  memberName: string;
  memberAvatar: string | null;
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Posts", href: "/admin/posts", icon: FileText },
  { label: "Achievements", href: "/admin/achievements", icon: Trophy },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  // { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Sponsors", href: "/admin/sponsors", icon: Heart },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminSidebar = ({ memberName, memberAvatar }: SidebarProps) => {
  const pathname = usePathname();

  // Extract the path after locale (e.g., /vi/admin/members → /admin/members)
  const normalizedPath = pathname.replace(/^\/[a-z]{2}/, "");

  const isActive = (href: string) => {
    if (href === "/admin") {
      return normalizedPath === "/admin";
    }
    return normalizedPath.startsWith(href);
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-border border-r bg-background">
      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(href)
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            href={href as "/"}
            key={href}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-border border-t p-3">
        <Link
          className="text-muted-foreground text-xs hover:text-primary"
          href="/"
        >
          ← Về trang chủ
        </Link>
      </div>
    </aside>
  );
};

export { AdminSidebar };
