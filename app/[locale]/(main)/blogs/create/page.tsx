import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { getBlogPermissionLevel, hasBlogCreationPermission } from "@/services/blog-permission";
import { UserBlogCreateForm } from "./form.client";

export const metadata: Metadata = {
  title: "Tạo bài viết mới"
};

export default async function CreateBlogPage() {
  const supabase = await createClientSsr();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const member = await prisma.member.findUnique({
    where: { id: user.id },
    select: { webRole: true }
  });

  if (!member) {
    redirect("/?error=need-member");
  }

  const level = await getBlogPermissionLevel();
  if (!hasBlogCreationPermission(member.webRole, level)) {
    redirect("/blogs?error=no-permission");
  }

  return <UserBlogCreateForm />;
}
