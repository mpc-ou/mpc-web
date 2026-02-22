import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { getMemberBySlug } from "./actions";
import { ProfilePageClient } from "./profile-client";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "me") {
    return { title: "Trang cá nhân" };
  }
  const { member } = await getMemberBySlug(slug);
  if (!member) {
    return { title: "Không tìm thấy" };
  }
  return {
    title: `${member.firstName} ${member.lastName} — MPC`,
    description: member.bio ?? "Hồ sơ thành viên MPC",
    openGraph: {
      images: member.avatar ? [member.avatar] : []
    }
  };
}

export default async function MemberProfilePage({ params }: Props) {
  const { slug, locale } = await params;

  // Handle /members/me → redirect to user's slug
  if (slug === "me") {
    const supabase = await createClientSsr();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${locale}/auth`);
    }

    const member = await prisma.member.findUnique({
      where: { authId: user.id },
      select: { slug: true }
    });

    if (!member?.slug) {
      redirect(`/${locale}/profile`);
    }

    redirect(`/${locale}/members/${member.slug}`);
  }

  const { member } = await getMemberBySlug(slug);
  if (!member) {
    notFound();
  }

  return <ProfilePageClient member={member as unknown as Parameters<typeof ProfilePageClient>[0]["member"]} />;
}
