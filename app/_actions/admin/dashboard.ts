"use server";

import { prisma } from "@/configs/prisma/db";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";
import { requireAdmin } from "./helpers";

async function fetchDashboardCounts() {
  const [
    members,
    activeMembers,
    eventsCount,
    postsCount,
    announcements,
    sponsors,
    departments,
    faqItems,
    galleryImages,
    achievementsCount,
    projects,
    activities,
    recaps,
    pendingReview,
    memberRoleGroups
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { isActive: true } }),
    prisma.post.count({ where: { type: "EVENT" } }),
    prisma.post.count({ where: { type: "BLOG" } }),
    prisma.announcement.count({ where: { isActive: true } }),
    prisma.sponsor.count({ where: { isActive: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.faqItem.count({ where: { isActive: true } }),
    prisma.galleryImage.count({ where: { isActive: true } }),
    prisma.post.count({ where: { type: "ACHIEVEMENT" } }),
    prisma.project.count(),
    prisma.activity.count({ where: { isActive: true } }),
    prisma.yearRecap.count(),
    prisma.post.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.member.groupBy({ by: ["webRole"], _count: { _all: true } })
  ]);

  const roleBreakdown = { ADMIN: 0, COLLABORATOR: 0, MEMBER: 0, GUEST: 0 };
  for (const g of memberRoleGroups) {
    roleBreakdown[g.webRole] = g._count._all;
  }

  return {
    members,
    activeMembers,
    events: eventsCount,
    posts: postsCount,
    announcements,
    sponsors,
    departments,
    faqItems,
    galleryImages,
    achievements: achievementsCount,
    projects,
    activities,
    recaps,
    pendingReview,
    roleBreakdown
  };
}

async function fetchDashboardChartData() {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 5);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const chartPosts = await prisma.post.findMany({
    where: { createdAt: { gte: startDate } },
    select: { type: true, createdAt: true }
  });

  const chartData: Array<{
    month: string;
    blog: number;
    event: number;
    achievement: number;
    key: string;
  }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthLabel = `M${String(d.getMonth() + 1).padStart(2, "0")}`;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    chartData.push({ key, month: monthLabel, blog: 0, event: 0, achievement: 0 });
  }

  const typeKey: Record<string, "blog" | "event" | "achievement"> = {
    BLOG: "blog",
    EVENT: "event",
    ACHIEVEMENT: "achievement"
  };

  for (const p of chartPosts) {
    const postDate = new Date(p.createdAt);
    const key = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, "0")}`;
    const match = chartData.find((item) => item.key === key);
    const field = typeKey[p.type];
    if (match && field) {
      match[field]++;
    }
  }

  return chartData.map(({ month, blog, event, achievement }) => ({ month, blog, event, achievement }));
}

export const adminGetDashboardStats = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const [stats, chartData] = await Promise.all([fetchDashboardCounts(), fetchDashboardChartData()]);
      return { stats, chartData };
    }
  });

export const adminGetLayoutData = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      if (!user) {
        throw new Error("Unauthorized");
      }
      let member = await prisma.member.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          webRole: true,
          firstName: true,
          middleName: true,
          lastName: true,
          avatar: true,
          email: true
        }
      });
      if (!member) {
        throw new Error("Forbidden");
      }
      const { isRootAdmin } = await import("@/utils/admin");
      if (isRootAdmin(member.email) && member.webRole !== "ADMIN") {
        await prisma.member.update({
          where: { id: user.id },
          data: { webRole: "ADMIN" }
        });
        member = { ...member, webRole: "ADMIN" };
      }
      if (member.webRole !== "ADMIN") {
        throw new Error("Forbidden");
      }
      const siteLogoSetting = await prisma.siteSetting.findUnique({
        where: { key: "site_logo" }
      });
      const logoUrl = siteLogoSetting?.value || "/images/logo.png";
      return { member, logoUrl };
    }
  });
