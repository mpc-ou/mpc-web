import { Building2, Calendar, FileText, Heart, HelpCircle, Image, Megaphone, Users } from "lucide-react";
import { Link } from "@/configs/i18n/routing";
import { adminGetDashboardStats } from "./actions";

export default async function AdminDashboard(): Promise<React.ReactNode> {
  const { data } = await adminGetDashboardStats();
  const stats = (data?.payload ?? {}) as Record<string, number>;

  const cards = [
    { label: "Thành viên", value: stats.members ?? 0, icon: Users, href: "/admin/members", color: "text-blue-500" },
    { label: "Sự kiện", value: stats.events ?? 0, icon: Calendar, href: "/admin/events", color: "text-green-500" },
    { label: "Bài viết", value: stats.posts ?? 0, icon: FileText, href: "/admin/posts", color: "text-purple-500" },
    {
      label: "Thông báo",
      value: stats.announcements ?? 0,
      icon: Megaphone,
      href: "/admin/announcements",
      color: "text-orange-500"
    },
    { label: "Nhà tài trợ", value: stats.sponsors ?? 0, icon: Heart, href: "/admin/sponsors", color: "text-pink-500" },
    {
      label: "Các ban",
      value: stats.departments ?? 0,
      icon: Building2,
      href: "/admin/departments",
      color: "text-teal-500"
    },
    { label: "FAQ", value: stats.faqItems ?? 0, icon: HelpCircle, href: "/admin/faq", color: "text-amber-500" },
    { label: "Gallery", value: stats.galleryImages ?? 0, icon: Image, href: "/admin/gallery", color: "text-cyan-500" }
  ];

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>Dashboard</h1>
        <p className='text-muted-foreground text-sm'>Tổng quan hệ thống quản trị MPC</p>
      </div>
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            className='flex flex-col gap-3 rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md'
            href={href as "/"}
            key={label}
          >
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-sm'>{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <span className='font-bold text-3xl text-foreground'>{value}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
