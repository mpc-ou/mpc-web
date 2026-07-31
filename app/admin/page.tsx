import {
  Activity,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Film,
  FolderGit2,
  Heart,
  HelpCircle,
  Image,
  Megaphone,
  Trophy,
  Users
} from "lucide-react";
import Link from "next/link";
import { adminGetDashboardStats } from "@/app/_actions/admin";
import { DashboardChart } from "./_components/dashboard-chart";

type DashboardChartData = {
  month: string;
  blog: number;
  event: number;
  achievement: number;
};

type RoleBreakdown = { ADMIN: number; COLLABORATOR: number; MEMBER: number; GUEST: number };

type DashboardStats = {
  members: number;
  activeMembers: number;
  events: number;
  posts: number;
  announcements: number;
  sponsors: number;
  departments: number;
  faqItems: number;
  galleryImages: number;
  achievements: number;
  projects: number;
  activities: number;
  recaps: number;
  pendingReview: number;
  roleBreakdown: RoleBreakdown;
};

type DashboardPayload = {
  stats?: DashboardStats;
  chartData?: DashboardChartData[];
};

const CARD_COLOR = {
  info: "text-info bg-info/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  primary: "text-primary bg-primary/10",
  destructive: "text-destructive bg-destructive/10",
  accent: "text-accent-foreground bg-accent"
} as const;

export default async function AdminDashboard(): Promise<React.ReactNode> {
  const { data } = await adminGetDashboardStats();
  const payload = (data?.payload ?? {}) as DashboardPayload;
  const stats = payload.stats;
  const chartData = payload.chartData ?? [];

  const cards: Array<{
    label: string;
    value: number;
    suffix?: string;
    icon: typeof Users;
    href: string;
    color: keyof typeof CARD_COLOR;
  }> = [
    {
      label: "Members",
      value: stats?.members ?? 0,
      suffix: `${stats?.activeMembers ?? 0} active`,
      icon: Users,
      href: "/admin/members",
      color: "info"
    },
    { label: "Events", value: stats?.events ?? 0, icon: Calendar, href: "/admin/posts?type=EVENT", color: "success" },
    { label: "Blog posts", value: stats?.posts ?? 0, icon: FileText, href: "/admin/posts?type=BLOG", color: "info" },
    {
      label: "Achievements",
      value: stats?.achievements ?? 0,
      icon: Trophy,
      href: "/admin/posts?type=ACHIEVEMENT",
      color: "warning"
    },
    { label: "Projects", value: stats?.projects ?? 0, icon: FolderGit2, href: "/admin/projects", color: "info" },
    { label: "Activities", value: stats?.activities ?? 0, icon: Activity, href: "/admin/activities", color: "primary" },
    {
      label: "Announcements",
      value: stats?.announcements ?? 0,
      icon: Megaphone,
      href: "/admin/announcements",
      color: "primary"
    },
    { label: "Sponsors", value: stats?.sponsors ?? 0, icon: Heart, href: "/admin/sponsors", color: "destructive" },
    {
      label: "Departments",
      value: stats?.departments ?? 0,
      icon: Building2,
      href: "/admin/departments",
      color: "accent"
    },
    { label: "FAQ", value: stats?.faqItems ?? 0, icon: HelpCircle, href: "/admin/faq", color: "warning" },
    { label: "Gallery", value: stats?.galleryImages ?? 0, icon: Image, href: "/admin/gallery", color: "accent" },
    { label: "Recaps", value: stats?.recaps ?? 0, icon: Film, href: "/admin/recaps", color: "primary" }
  ];

  const roleBreakdown = stats?.roleBreakdown ?? { ADMIN: 0, COLLABORATOR: 0, MEMBER: 0, GUEST: 0 };
  const totalRoles = Object.values(roleBreakdown).reduce((a, b) => a + b, 0) || 1;
  const roleColors: Record<keyof RoleBreakdown, string> = {
    ADMIN: "bg-destructive",
    COLLABORATOR: "bg-primary",
    MEMBER: "bg-info",
    GUEST: "bg-muted-foreground"
  };

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='font-bold text-2xl text-foreground'>Dashboard</h1>
        <p className='text-muted-foreground text-sm'>MPC admin overview</p>
      </div>

      {!!stats?.pendingReview && stats.pendingReview > 0 && (
        <Link
          className='flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-warning-foreground transition-colors hover:bg-warning/15'
          href='/admin/posts?status=PENDING_REVIEW'
        >
          <AlertCircle className='h-5 w-5 shrink-0 text-warning' />
          <span className='text-sm'>
            <strong className='font-semibold'>{stats.pendingReview}</strong> blog post
            {stats.pendingReview === 1 ? "" : "s"} pending review — click to review now.
          </span>
        </Link>
      )}

      {/* Stat cards — wraps as more metrics are added */}
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
        {cards.map(({ label, value, suffix, icon: Icon, href, color }) => (
          <Link
            className='flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md'
            href={href}
            key={label}
          >
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-xs'>{label}</span>
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${CARD_COLOR[color]}`}>
                <Icon className='h-3.5 w-3.5' />
              </span>
            </div>
            <div className='flex items-baseline gap-1.5'>
              <span className='font-bold text-2xl text-foreground'>{value}</span>
              {suffix && <span className='text-muted-foreground text-xs'>{suffix}</span>}
            </div>
          </Link>
        ))}
      </div>

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
        {/* 6-Month Chart */}
        <div className='xl:col-span-2'>
          <DashboardChart data={chartData} />
        </div>

        {/* Member role breakdown */}
        <div className='rounded-xl border border-border bg-background p-6 shadow-sm'>
          <h3 className='font-semibold text-base text-foreground tracking-tight'>Member roles</h3>
          <p className='mb-4 text-muted-foreground text-xs'>Distribution of {stats?.members ?? 0} members by role</p>

          <div className='mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted'>
            {(Object.keys(roleBreakdown) as Array<keyof RoleBreakdown>).map((role) => {
              const count = roleBreakdown[role];
              if (count === 0) {
                return null;
              }
              return (
                <div
                  className={roleColors[role]}
                  key={role}
                  style={{ width: `${(count / totalRoles) * 100}%` }}
                  title={`${role}: ${count}`}
                />
              );
            })}
          </div>

          <div className='flex flex-col gap-2.5'>
            {(Object.keys(roleBreakdown) as Array<keyof RoleBreakdown>).map((role) => (
              <div className='flex items-center justify-between text-sm' key={role}>
                <span className='flex items-center gap-2 text-muted-foreground'>
                  <span className={`h-2 w-2 rounded-full ${roleColors[role]}`} />
                  {role}
                </span>
                <span className='font-medium text-foreground'>{roleBreakdown[role]}</span>
              </div>
            ))}
          </div>

          <Link className='mt-5 inline-block text-primary text-xs hover:underline' href='/admin/members'>
            Manage members →
          </Link>
        </div>
      </div>
    </div>
  );
}
