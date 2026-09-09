"use client";

import {
  Activity,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Film,
  FolderGit2,
  Heart,
  HelpCircle,
  Image,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sliders,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarProps = {
  memberName: string;
  memberAvatar: string | null;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
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
  { label: "Site Config", href: "/admin/site-config", icon: Sliders },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

const AdminSidebar = ({
  memberName: _memberName,
  memberAvatar: _memberAvatar,
  isOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapsed
}: SidebarProps) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-border border-r bg-background shadow-lg transition-all duration-300 ease-in-out lg:static lg:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${collapsed ? "w-60 lg:w-16" : "w-60"}`}
    >
      {/* Mobile Sidebar Header */}
      <div className='flex h-14 shrink-0 items-center justify-between border-border border-b px-4 lg:hidden'>
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
      <nav className='flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-2'>
        {navItems.map(({ label, href, icon: Icon }) => {
          const link = (
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                collapsed ? "lg:justify-center" : ""
              } ${
                isActive(href)
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              href={href}
              key={href}
              onClick={onClose}
            >
              <Icon className='h-4 w-4 shrink-0' />
              <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
            </Link>
          );

          if (!collapsed) {
            return link;
          }

          return (
            <Tooltip delayDuration={200} key={href}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent className='hidden lg:block' side='right'>
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='flex shrink-0 items-center justify-between border-border border-t bg-background p-2'>
        <Link
          className={`rounded-lg px-2 py-1.5 text-muted-foreground text-xs hover:text-primary ${collapsed ? "lg:hidden" : ""}`}
          href='/'
          onClick={onClose}
        >
          ← Back to site
        </Link>
        <Button
          className='hidden h-8 w-8 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground lg:flex'
          onClick={onToggleCollapsed}
          size='icon'
          variant='ghost'
        >
          {collapsed ? <ChevronsRight className='h-4 w-4' /> : <ChevronsLeft className='h-4 w-4' />}
        </Button>
      </div>
    </aside>
  );
};

export { AdminSidebar };
