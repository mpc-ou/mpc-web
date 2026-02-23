import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClientSsr } from "@/configs/supabase/server";
import { getMemberBySlug, getMemberSlugByAuthId } from "./actions";
import { ProfilePageClient } from "./profile-client";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "me") {
    return { title: "Trang cá nhân" };
  }
  const { data } = await getMemberBySlug(slug);
  const member = (data?.payload as any)?.member;

  if (!member) {
    return { title: "Không tìm thấy" };
  }
  return {
    title: `${member.firstName} ${member.lastName} — MPC`,
    description: member.bio ?? "Hồ sơ thành viên MPC",
    openGraph: {
      images: member.avatar ? [member.avatar] : [],
    },
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const { slug, locale } = await params;

  // Handle /members/me → redirect to user's slug
  if (slug === "me") {
    const supabase = await createClientSsr();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${locale}/auth`);
    }

    const { data } = await getMemberSlugByAuthId();
    const authSlug = (data?.payload as any)?.slug;

    if (!authSlug) {
      redirect(`/${locale}/profile`);
    }

    redirect(`/${locale}/members/${authSlug}`);
  }

  const { data } = await getMemberBySlug(slug);
  const member = (data?.payload as any)?.member;

  if (!member) {
    notFound();
  }

  return (
    <ProfilePageClient
      member={
        member as unknown as Parameters<typeof ProfilePageClient>[0]["member"]
      }
    />
  );
}
