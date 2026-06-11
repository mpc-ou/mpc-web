import type { Department as PrismaDepartment } from "@/configs/prisma/generated/prisma/client";

export type Department = Pick<PrismaDepartment, "id" | "nameVi" | "nameEn" | "slug">;

export type ClubRoleEntry = {
  id: string;
  position: string;
  term: number | null;
  note: string | null;
  startAt: string;
  endAt: string | null;
  department: Department | null;
};

export type SocialEntry = { id?: string; platform: string; url: string };

export const POSITION_LABELS: Record<string, string> = {
  PRESIDENT: "Chủ nhiệm CLB",
  VICE_PRESIDENT: "Phó chủ nhiệm",
  DEPARTMENT_LEADER: "Trưởng ban",
  DEPARTMENT_VICE_LEADER: "Phó ban",
  DEPARTMENT_MEMBER: "Thành viên ban",
  COLLABORATOR: "Cộng tác viên",
  ADVISOR: "Cố vấn"
};

export { PLATFORMS } from "@/constants/common";
