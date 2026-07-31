import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getMemberBySlug, getMemberSlugByAuthId } from "@/app/_actions/main/member-detail";
import { createClientSsr } from "@/configs/supabase/server";
import { getFullName } from "@/lib/utils";
import { generatePageSeo } from "@/utils/seo";
import type { Member } from "./profile-client";
import { ProfilePageClient } from "./profile-client";

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  if (slug === "me") {
    return { title: "Trang cá nhân" };
  }
  const { data } = await getMemberBySlug(slug);
  const member = (data?.payload as { member: Member | null } | undefined)?.member;

  if (!member) {
    return { title: "Không tìm thấy" };
  }
  return generatePageSeo({
    page: "memberDetail",
    title: getFullName(member.firstName, member.middleName, member.lastName, locale),
    description: member.bio || undefined,
    locale: locale || "vi",
    pathname: `/members/${slug}`,
    image: member.avatar || undefined
  });
}

export default async function MemberProfilePage({ params }: Props): Promise<React.ReactNode> {
  const { slug, locale } = await params;

  if (slug === "me") {
    const supabase = await createClientSsr();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/${locale}/auth`);
    }

    const { data } = await getMemberSlugByAuthId();
    const authSlug = (data?.payload as { slug: string | null } | undefined)?.slug;

    if (!authSlug) {
      redirect(`/${locale}/profile`);
    }

    redirect(`/${locale}/members/${authSlug}`);
  }

  const { data } = await getMemberBySlug(slug);
  const member = (data?.payload as { member: Member | null } | undefined)?.member;

  if (!member) {
    notFound();
  }

  return <ProfilePageClient member={member} />;
}
