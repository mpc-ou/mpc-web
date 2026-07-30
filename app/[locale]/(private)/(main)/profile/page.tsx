import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { getProfile } from "@/app/_actions/profile/profile";
import { LoadingComponent } from "@/components/custom/loading";
import type { Member } from "@/configs/prisma/generated/prisma/client";
import { FormClient, FormSkeleton } from "./form.client";

type UserWithMember = SupabaseUser & {
  member?: Member | null;
  name?: string;
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return {
    title: t("pageTitle"),
    description: t("pageDesc")
  };
}

export default async function Page({ params }: PageProps): Promise<React.ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("profile");
  const { data, error } = await getProfile();

  if (error) {
    throw new Error(error.message);
  }
  const user = data?.payload as UserWithMember;

  const socialsArray = (() => {
    try {
      const parsed = user?.member?.socials ? JSON.parse(JSON.stringify(user.member.socials)) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const initialData = {
    firstName:
      user?.member?.firstName || user?.name?.split(" ").at(0) || user?.user_metadata?.full_name?.split(" ").at(0) || "",
    middleName: user?.member?.middleName || "",
    lastName:
      user?.member?.lastName ||
      user?.name?.split(" ").at(-1) ||
      user?.user_metadata?.full_name?.split(" ").at(-1) ||
      "",
    bio: user?.member?.bio || "",
    phone: user?.member?.phone || "",
    studentId: user?.member?.studentId || "",
    dob: user?.member?.dob ? new Date(user.member.dob).toISOString().split("T")[0] : null,
    slug: user?.member?.slug || "",
    avatar: user?.member?.avatar || user?.user_metadata?.avatar_url || null,
    coverImage: user?.member?.coverImage || null,
    socials: socialsArray,
    spotifyUri: user?.member?.spotifyUri || "",
    showDob: user?.member?.showDob ?? true,
    showPhone: user?.member?.showPhone ?? true,
    showStudentId: user?.member?.showStudentId ?? true
  };

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-6'>
        <h1 className='font-bold text-3xl tracking-tight'>{t("pageTitle")}</h1>
        <p className='mt-1 text-muted-foreground'>{t("pageDesc")}</p>
      </div>
      <FormClient initialData={initialData} />
    </div>
  );
}
