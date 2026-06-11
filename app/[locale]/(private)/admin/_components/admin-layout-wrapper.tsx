"use client";

import { useState } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./sidebar";

type Props = {
  children: React.ReactNode;
  memberAvatar: string | null;
  memberName: string;
  memberRole: string;
  logoUrl: string;
};

export function AdminLayoutWrapper({ children, memberAvatar, memberName, memberRole, logoUrl }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-background'>
      <AdminHeader
        logoUrl={logoUrl}
        memberAvatar={memberAvatar}
        memberName={memberName}
        memberRole={memberRole}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className='relative flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          memberAvatar={memberAvatar}
          memberName={memberName}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Mobile Sidebar overlay backdrop */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className='flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
