"use server";

import { handleErrorServerWithAuth, prisma, requireAdmin } from "./helpers";

export const adminGetDashboardStats = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const [
        members,
        eventsCount,
        postsCount,
        announcements,
        sponsors,
        departments,
        faqItems,
        galleryImages,
        achievementsCount,
        projects
      ] = await Promise.all([
        prisma.member.count(),
        prisma.post.count({ where: { type: "EVENT" } }),
        prisma.post.count({ where: { type: "BLOG" } }),
        prisma.announcement.count({ where: { isActive: true } }),
        prisma.sponsor.count({ where: { isActive: true } }),
        prisma.department.count({ where: { isActive: true } }),
        prisma.faqItem.count({ where: { isActive: true } }),
        prisma.galleryImage.count({ where: { isActive: true } }),
        prisma.post.count({ where: { type: "ACHIEVEMENT" } }),
        prisma.project.count()
      ]);

      // Calculate last 6 months start date
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      // Query posts for chart
      const chartPosts = await prisma.post.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          type: true,
          createdAt: true
        }
      });

      // Initialize monthly slots
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
        const monthLabel = `Tháng ${String(d.getMonth() + 1).padStart(2, "0")}`;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        chartData.push({
          key,
          month: monthLabel,
          blog: 0,
          event: 0,
          achievement: 0
        });
      }

      // Populate counts
      for (const p of chartPosts) {
        const postDate = new Date(p.createdAt);
        const key = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, "0")}`;
        const match = chartData.find((item) => item.key === key);
        if (match) {
          if (p.type === "BLOG") {
            match.blog++;
          } else if (p.type === "EVENT") {
            match.event++;
          } else if (p.type === "ACHIEVEMENT") {
            match.achievement++;
          }
        }
      }

      // Remove keys before returning
      const formattedChartData = chartData.map(({ month, blog, event, achievement }) => ({
        month,
        blog,
        event,
        achievement
      }));

      return {
        stats: {
          members,
          events: eventsCount,
          posts: postsCount,
          announcements,
          sponsors,
          departments,
          faqItems,
          galleryImages,
          achievements: achievementsCount,
          projects
        },
        chartData: formattedChartData
      };
    }
  });
