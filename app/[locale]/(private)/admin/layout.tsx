import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { isRootAdmin } from "@/utils/admin";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./sidebar";

async function AdminLayoutInner({ children }: { children: ReactNode }) {
  const supabase = await createClientSsr();
  const {
    data: { user }
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
      email: true
    }
  });

  if (!member) {
    redirect("/");
  }

  if (isRootAdmin(member.email) && member.webRole !== "ADMIN") {
    await prisma.member.update({
      where: { authId: user.id },
      data: { webRole: "ADMIN" }
    });
    member = { ...member, webRole: "ADMIN" };
  }

  if (member.webRole !== "ADMIN") {
    redirect("/");
  }

  const memberName = `${member.firstName} ${member.lastName}`;

  return (
    <div className='flex h-screen flex-col'>
      <AdminHeader memberAvatar={member.avatar} memberName={memberName} memberRole={member.webRole} />
      <div className='flex flex-1 overflow-hidden'>
        <AdminSidebar memberAvatar={member.avatar} memberName={memberName} />
        <main className='flex-1 overflow-y-auto bg-muted/30 p-6'>{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
