"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./sidebar";

type Props = {
  children: React.ReactNode;
  memberAvatar: string | null;
  memberName: string;
  memberRole: string;
  logoUrl: string;
};

const COLLAPSED_STORAGE_KEY = "admin-sidebar-collapsed";

export function AdminLayoutWrapper({ children, memberAvatar, memberName, memberRole, logoUrl }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-background'>
      <AdminHeader
        collapsed={collapsed}
        logoUrl={logoUrl}
        memberAvatar={memberAvatar}
        memberName={memberName}
        memberRole={memberRole}
        onToggleCollapsed={toggleCollapsed}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className='relative flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          isOpen={sidebarOpen}
          memberAvatar={memberAvatar}
          memberName={memberName}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapsed={toggleCollapsed}
        />

        {/* Mobile Sidebar overlay backdrop */}
        {sidebarOpen && (
          <button
            aria-label='Close sidebar'
            className='fixed inset-0 z-30 cursor-default bg-black/60 backdrop-blur-xs lg:hidden'
            onClick={() => setSidebarOpen(false)}
            type='button'
          />
        )}

        {/* Main Content Area */}
        <main className='flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
