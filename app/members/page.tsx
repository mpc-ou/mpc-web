import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import MembersPageClient from "./page-client";

export const metadata: Metadata = {
  title: "Thành viên CLB | " + SITE.name,
  description: "Danh sách thành viên CLB MPC, bao gồm Ban Chủ nhiệm, Ban Cán sự và các thành viên",
};

export default function MembersPage() {
  return <MembersPageClient />;
}
