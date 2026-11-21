import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getMemberBySlug, getMemberSlugByAuthId } from "@/app/_actions/main/member-detail";
import { PersonJsonLd } from "@/components/seo/json-ld";
import { createClientSsr } from "@/configs/supabase/server";
import { SITE_URL } from "@/constants/seo";
import { getFullName } from "@/lib/utils";
import { generatePageSeo } from "@/utils/seo";
import { parseSocials } from "@/utils/social";
import type { Member } from "./profile-client";
import { ProfilePageClient } from "./profile-client";

type Props = { params: Promise<{ slug: string; locale: string }> };

function resolveMemberDeptName(member: Member, isEn: boolean): string | null {
  const activeRole = member.clubRoles.find((r) => !r.endAt) ?? member.clubRoles[0];
  const dept = activeRole?.department;
  if (!dept) {
    return null;
  }
  if (isEn) {
    return `Department: ${dept.nameEn || dept.nameVi}`;
  }
  return dept.nameVi;
}

function buildMemberStatsSummary(member: Member, isEn: boolean): string {
  const achCount = member.achievements.length;
  const projCount = member.projects.length;
  const postCount = member.authoredPosts.length;
  const labels = isEn
    ? [
        achCount > 0 ? `${achCount} achievements` : "",
        projCount > 0 ? `${projCount} projects` : "",
        postCount > 0 ? `${postCount} articles` : ""
      ]
    : [
        achCount > 0 ? `${achCount} thành tích` : "",
        projCount > 0 ? `${projCount} dự án` : "",
        postCount > 0 ? `${postCount} bài viết` : ""
      ];
  return labels.filter(Boolean).join(", ");
}

function buildMemberSeoDescription(member: Member, fullName: string, locale: string): string {
  if (member.bio?.trim()) {
    return member.bio.trim();
  }
  const isEn = locale === "en";
  const deptPart = resolveMemberDeptName(member, isEn);
  const stats = buildMemberStatsSummary(member, isEn);
  const head = isEn
    ? `${fullName} – Member at MPClub (Mobile Programming Club, HCMOU)`
    : `${fullName} – Thành viên CLB Lập trình trên thiết bị di động (MPClub - HCMOU)`;
  const parts = [head, deptPart, stats].filter(Boolean);
  return `${parts.join(" · ")}.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const tNotFound = await getTranslations({ locale, namespace: "seo.notFound" });
  if (slug === "me") {
    return {
      title: tNotFound("profile"),
      robots: { index: false, follow: false }
    };
  }
  const { data } = await getMemberBySlug(slug);
  const member = (data?.payload as { member: Member | null } | undefined)?.member;

  if (!member) {
    return {
      title: tNotFound("member"),
      robots: { index: false, follow: false }
    };
  }

  const canonicalSlug = member.slug || slug;
  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const description = buildMemberSeoDescription(member, fullName, locale);
  const isThinMember =
    member.webRole === "GUEST" ||
    (!member.bio?.trim() &&
      member.clubRoles.length === 0 &&
      member.achievements.length === 0 &&
      member.projects.length === 0 &&
      member.authoredPosts.length === 0);

  return generatePageSeo({
    page: "memberDetail",
    title: fullName,
    description,
    locale: locale || "vi",
    pathname: `/members/${canonicalSlug}`,
    image: member.avatar || member.coverImage || undefined,
    type: "profile",
    keywords: [fullName, member.slug || ""].filter(Boolean),
    noIndex: isThinMember
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

  if (member.slug && slug !== member.slug) {
    permanentRedirect(`/${locale}/members/${member.slug}`);
  }

  const fullName = getFullName(member.firstName, member.middleName, member.lastName, locale);
  const description = buildMemberSeoDescription(member, fullName, locale);
  const sameAs = parseSocials(member.socials)
    .map((s) => s.url)
    .filter((u) => u.startsWith("http"));

  return (
    <>
      <PersonJsonLd
        description={description}
        image={member.avatar}
        name={fullName}
        sameAs={sameAs}
        url={`${SITE_URL}/${locale}/members/${member.slug || slug}`}
      />
      <ProfilePageClient member={member} />
    </>
  );
}
