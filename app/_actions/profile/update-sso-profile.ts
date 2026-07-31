"use server";

import { updateTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { _CACHE_MEMBERS, _CACHE_PROFILE } from "@/constants/cache";
import { getSession } from "@/utils/session";

const issuer = process.env.SSO_ISSUER || "https://auth.mpclub.dev";

export type UpdateSsoProfileData = {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  dob?: string | null;
  mssv?: string | null;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  avatar?: string | null;
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: SSO profile field update & sync
export async function updateSsoProfile(data: UpdateSsoProfileData): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Chưa đăng nhập" };
  }

  const body: Record<string, string | null> = {};
  if (data.firstName !== undefined) {
    body.firstName = data.firstName;
  }
  if (data.middleName !== undefined) {
    body.middleName = data.middleName;
  }
  if (data.lastName !== undefined) {
    body.lastName = data.lastName;
  }
  if (data.dob !== undefined) {
    body.dob = data.dob;
  }
  if (data.mssv !== undefined) {
    body.mssv = data.mssv;
  }
  if (data.phone !== undefined) {
    body.phone = data.phone;
  }
  if (data.address !== undefined) {
    body.address = data.address;
  }
  if (data.bio !== undefined) {
    body.bio = data.bio;
  }
  if (data.avatar !== undefined) {
    body.avatar = data.avatar;
  }

  const response = await fetch(`${issuer}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    let errorMsg = "Cập nhật thất bại";
    try {
      const errBody = await response.json();
      errorMsg = errBody?.message || errBody?.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    return { success: false, error: errorMsg };
  }

  await prisma.member.updateMany({
    where: { id: session.id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.middleName !== undefined && { middleName: data.middleName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.dob !== undefined && { dob: data.dob ? new Date(data.dob) : null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.mssv !== undefined && { studentId: data.mssv || null })
    }
  });

  updateTag(`${_CACHE_PROFILE}::${session.id}`);
  updateTag(_CACHE_MEMBERS);

  return { success: true };
}
