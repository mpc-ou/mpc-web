import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { adminGetMembers } from "@/app/_actions/admin";
import { getProfile } from "@/app/_actions/profile/profile";
import { formatLocalDate } from "@/utils/handle-datetime";
import type { UserSession } from "@/utils/session";
import { MemberCardClient } from "./client";

type ProfileClubRole = {
  startAt: Date | string;
  endAt: Date | string | null;
  department?: { nameVi: string } | null;
};

type ProfileMember = {
  firstName: string;
  lastName: string;
  studentId: string | null;
  dob: Date | string | null;
  avatar: string | null;
  slug: string | null;
  webRole: string;
  joinedClubAt: Date | string | null;
  clubRoles?: ProfileClubRole[];
};

type ProfilePayload = UserSession & {
  member: ProfileMember | null;
  user_metadata?: { avatar_url?: string; full_name?: string };
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return {
    title: t("memberCard.title")
  };
}

async function fetchImageAsBase64(url: string | null) {
  if (!url) {
    return "";
  }
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) {
      return url;
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error("Failed to fetch image as base64:", error);
    return url;
  }
}

export default async function MemberCardPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<React.ReactNode> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const targetMemberSlug = resolvedSearchParams?.member as string | undefined;

  const { data, error } = await getProfile();

  if (error || !data?.payload) {
    throw new Error(error?.message || "User not found");
  }

  const user = data.payload as ProfilePayload;
  let member = user.member;

  if (!member || member.webRole === "GUEST") {
    return (
      <div className='flex h-[calc(100vh-4rem)] items-center justify-center p-4'>
        <div className='space-y-4 text-center'>
          <h1 className='font-bold text-2xl text-destructive'>Không có quyền truy cập</h1>
          <p className='text-muted-foreground'>Bạn phải là thành viên CLB để xem thẻ này.</p>
        </div>
      </div>
    );
  }

  // If ADMIN and a target member slug is provided, fetch that member's data instead
  if (member.webRole === "ADMIN" && targetMemberSlug) {
    const allMembersRes = await adminGetMembers();
    if (allMembersRes.data?.payload) {
      const targetMember = (allMembersRes.data.payload as ProfileMember[]).find((m) => m.slug === targetMemberSlug);
      if (targetMember) {
        member = targetMember;
      }
    }
  }

  const activeRole = member.clubRoles?.find((r) => !r.endAt) || member.clubRoles?.[0];
  const departmentName = activeRole?.department?.nameVi || "Thành viên";

  let joinedYear = new Date().getFullYear().toString();
  if (member.joinedClubAt) {
    joinedYear = new Date(member.joinedClubAt).getFullYear().toString();
  } else if (member.clubRoles && member.clubRoles.length > 0) {
    const earliestRole = [...member.clubRoles].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
    joinedYear = new Date(earliestRole.startAt).getFullYear().toString();
  }

  const avatarUrl = member.avatar || user.user_metadata?.avatar_url || "";
  const base64Avatar = await fetchImageAsBase64(avatarUrl);

  const cardData = {
    firstName: member.firstName,
    lastName: member.lastName,
    studentId: member.studentId || "Không có MSSV",
    dob: member.dob ? formatLocalDate(member.dob, locale, "dd/MM/yyyy") : "Bí mật",
    department: departmentName,
    joinedYear,
    avatar: base64Avatar
  };

  return <MemberCardClient data={cardData} locale={locale} />;
}
