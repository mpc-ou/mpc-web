"use server";

import { handleErrorServerWithAuth, prisma, requireAdmin } from "./_helpers";

export const adminGetDashboardStats = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      await requireAdmin(user);
      const [
        members,
        events,
        posts,
        announcements,
        sponsors,
        departments,
        faqItems,
        galleryImages,
        achievements,
        projects
      ] = await Promise.all([
        prisma.member.count(),
        prisma.event.count(),
        prisma.post.count(),
        prisma.announcement.count({ where: { isActive: true } }),
        prisma.sponsor.count({ where: { isActive: true } }),
        prisma.department.count({ where: { isActive: true } }),
        prisma.faqItem.count({ where: { isActive: true } }),
        prisma.galleryImage.count({ where: { isActive: true } }),
        prisma.achievement.count(),
        prisma.project.count()
      ]);
      return {
        members,
        events,
        posts,
        announcements,
        sponsors,
        departments,
        faqItems,
        galleryImages,
        achievements,
        projects
      };
    }
  });
