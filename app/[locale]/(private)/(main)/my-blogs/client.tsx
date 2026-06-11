"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  Loader2,
  Plus,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getUserPosts } from "@/app/_actions/profile/user-blogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  summaryVi: string | null;
  thumbnail: string | null;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: {
    label: "Nháp",
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    icon: <Clock className='h-3 w-3' />
  },
  PENDING_REVIEW: {
    label: "Chờ duyệt",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: <AlertTriangle className='h-3 w-3' />
  },
  PUBLISHED: {
    label: "Đã xuất bản",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    icon: <CheckCircle2 className='h-3 w-3' />
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: <XCircle className='h-3 w-3' />
  },
  ARCHIVED: {
    label: "Lưu trữ",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    icon: <Clock className='h-3 w-3' />
  }
};

export function MyBlogsClient() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getUserPosts();
      if (res.data?.payload) {
        setPosts((res.data.payload as any).posts ?? []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Create button */}
      <div className='flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
            <FileText className='h-5 w-5 text-primary' />
          </div>
          <div>
            <p className='font-semibold text-sm'>Viết bài mới</p>
            <p className='text-muted-foreground text-xs'>Chia sẻ kiến thức và trải nghiệm của bạn</p>
          </div>
        </div>
        <Link href='/blogs/create'>
          <Button size='sm'>
            <Plus className='mr-1.5 h-4 w-4' />
            Tạo bài viết
          </Button>
        </Link>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <div className='flex flex-col items-center gap-4 py-20 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-muted'>
            <FileText className='h-8 w-8 text-muted-foreground/50' />
          </div>
          <div>
            <p className='font-semibold text-foreground'>Chưa có bài viết nào</p>
            <p className='mt-1 text-muted-foreground text-sm'>Bắt đầu viết bài đầu tiên của bạn ngay hôm nay.</p>
          </div>
          <Link href='/blogs/create'>
            <Button size='sm' variant='outline'>
              <Plus className='mr-1.5 h-4 w-4' />
              Viết bài mới
            </Button>
          </Link>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {posts.map((post) => {
            const st = STATUS_MAP[post.status] ?? STATUS_MAP.DRAFT;
            const canEdit = post.status === "DRAFT" || post.status === "PENDING_REVIEW";

            return (
              <div
                className='group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md'
                key={post.id}
              >
                {/* Thumbnail */}
                <div className='hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:block'>
                  {post.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt='' className='h-full w-full object-cover' src={post.thumbnail} />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <FileText className='h-6 w-6 text-muted-foreground/30' />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className='min-w-0 flex-1'>
                  <div className='mb-1.5 flex items-center gap-2'>
                    <Badge
                      className={`inline-flex items-center gap-1 border px-2 py-0.5 font-medium text-[11px] ${st.color}`}
                    >
                      {st.icon}
                      {st.label}
                    </Badge>
                    <span className='flex items-center gap-1 font-mono text-[11px] text-muted-foreground'>
                      <CalendarDays className='h-3 w-3' />
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <h3 className='truncate font-semibold text-foreground text-sm group-hover:text-primary'>
                    {post.status === "PUBLISHED" ? <Link href={`/blogs/${post.slug}`}>{post.title}</Link> : post.title}
                  </h3>
                  {post.summaryVi && (
                    <p className='mt-0.5 line-clamp-1 text-muted-foreground text-xs'>{post.summaryVi}</p>
                  )}
                </div>

                {/* Actions */}
                <div className='flex shrink-0 items-center gap-1.5'>
                  {post.status === "PUBLISHED" && (
                    <Link href={`/blogs/${post.slug}`}>
                      <Button className='h-8 w-8' size='icon' title='Xem bài viết' variant='ghost'>
                        <ArrowUpRight className='h-4 w-4' />
                      </Button>
                    </Link>
                  )}
                  {canEdit && (
                    <Link href={`/my-blogs/${post.id}/edit`}>
                      <Button className='h-8 w-8' size='icon' title='Chỉnh sửa' variant='ghost'>
                        <Edit3 className='h-4 w-4' />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
