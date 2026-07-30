"use client";

import {
  Activity,
  Building2,
  Calendar,
  FileText,
  Film,
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
  X
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

type SidebarProps = {
  memberName: string;
  memberAvatar: string | null;
  isOpen?: boolean;
  onClose?: () => void;
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Content", href: "/admin/posts", icon: FileText },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { label: "Activities", href: "/admin/activities", icon: Activity },
  { label: "Recaps", href: "/admin/recaps", icon: Film },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  { label: "Sponsors", href: "/admin/sponsors", icon: Heart },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

const LOCALE_PREFIX_RE = /^\/[a-z]{2}/;

const AdminSidebar = ({ memberName, memberAvatar, isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();

  // Extract the path after locale (e.g., /vi/admin/members → /admin/members)
  const normalizedPath = pathname.replace(LOCALE_PREFIX_RE, "");

  const isActive = (href: string) => {
    if (href === "/admin") {
      return normalizedPath === "/admin";
    }
    return normalizedPath.startsWith(href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-border border-r bg-background shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Mobile Sidebar Header */}
      <div className='flex h-14 items-center justify-between border-border border-b px-4 lg:hidden'>
        <span className='font-bold text-foreground text-sm'>MPC Menu</span>
        <Button
          className='h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground'
          onClick={onClose}
          size='icon'
          variant='ghost'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      {/* Nav Items */}
      <nav className='flex flex-1 flex-col gap-0.5 overflow-y-auto p-2'>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(href)
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            href={href as "/"}
            key={href}
            onClick={onClose}
          >
            <Icon className='h-4 w-4 shrink-0' />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className='border-border border-t bg-background p-3'>
        <Link className='text-muted-foreground text-xs hover:text-primary' href='/' onClick={onClose}>
          ← Về trang chủ
        </Link>
      </div>
    </aside>
  );
};

export { AdminSidebar };
