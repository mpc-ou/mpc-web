import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import type { Member } from "@/configs/prisma/generated/prisma/client";
import { getProfile } from "./actions";
import { FormClient } from "./form.client";

type UserWithMember = SupabaseUser & {
  member?: Member | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return {
    title: t("title"),
  };
}

export default async function Page() {
  const { data, error } = await getProfile();

  if (error) {
    throw new Error(error.message);
  }
  const user = data?.payload as UserWithMember;

  const socialsArray = (() => {
    try {
      const parsed = user?.member?.socials
        ? JSON.parse(JSON.stringify(user.member.socials))
        : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const initialData = {
    firstName:
      user?.member?.firstName ||
      user?.user_metadata.full_name?.split(" ").at(0) ||
      "",
    lastName:
      user?.member?.lastName ||
      user?.user_metadata.full_name?.split(" ").at(-1) ||
      "",
    bio: user?.member?.bio || "",
    phone: user?.member?.phone || "",
    studentId: user?.member?.studentId || "",
    dob: user?.member?.dob
      ? new Date(user.member.dob).toISOString().split("T")[0]
      : null,
    slug: user?.member?.slug || "",
    avatar: user?.member?.avatar || user?.user_metadata.avatar_url || null,
    coverImage: (user?.member as any)?.coverImage || null,
    socials: socialsArray,
  };

  const linkedProviders = user?.identities?.map((id) => id.provider) || [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-bold text-3xl tracking-tight">Trang cá nhân</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý hồ sơ công khai và các liên kết mạng xã hội của bạn.
        </p>
      </div>
      <FormClient initialData={initialData} linkedProviders={linkedProviders} />
    </div>
  );
}
