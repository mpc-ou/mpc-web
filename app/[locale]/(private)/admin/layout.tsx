import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { isRootAdmin } from "@/utils/admin";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./sidebar";

async function AdminLayoutInner({ children }: { children: ReactNode }) {
  const supabase = await createClientSsr();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  let member = await prisma.member.findUnique({
    where: { authId: user.id },
    select: {
      webRole: true,
      firstName: true,
      lastName: true,
      avatar: true,
      email: true,
    },
  });

  if (!member) {
    redirect("/");
  }

  if (isRootAdmin(member.email) && member.webRole !== "ADMIN") {
    await prisma.member.update({
      where: { authId: user.id },
      data: { webRole: "ADMIN" },
    });
    member = { ...member, webRole: "ADMIN" };
  }

  if (member.webRole !== "ADMIN") {
    redirect("/");
  }

  const memberName = `${member.firstName} ${member.lastName}`;

  return (
    <div className="flex h-screen flex-col">
      <AdminHeader
        memberAvatar={member.avatar}
        memberName={memberName}
        memberRole={member.webRole}
      />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar memberAvatar={member.avatar} memberName={memberName} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminLayoutFallback() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header skeleton */}
      <div className="flex h-14 items-center justify-between border-border border-b bg-background px-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden w-56 flex-col gap-2 border-border border-r bg-background p-4 md:flex">
          <Skeleton className="mb-4 h-6 w-28" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              className="h-8 w-full rounded-md"
              key={`nav-${i.toString()}`}
            />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="flex-1 bg-muted/30 p-6">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-36" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  className="h-24 rounded-xl"
                  key={`card-${i.toString()}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
