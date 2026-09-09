import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkUserBlogCreationPermission } from "@/app/_actions/main";
import { UserBlogCreateForm } from "./form.client";

export const metadata: Metadata = {
  title: "Tạo bài viết mới"
};

export default async function CreateBlogPage() {
  const { data: canCreateData, error } = await checkUserBlogCreationPermission();

  if (error) {
    redirect("/login");
  }

  const canCreate = canCreateData?.payload ?? false;

  if (!canCreate) {
    redirect("/blogs?error=no-permission");
  }

  return <UserBlogCreateForm />;
}
