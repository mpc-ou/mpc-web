"use client";

import { ChevronLeft, ChevronRight, FileText, Pencil, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import type { PostCardData } from "@/components/post-card";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/configs/i18n/routing";

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  publishedAt: string;
  author: {
    firstName: string;
    lastName: string;
    avatar?: string;
    slug?: string;
  };
  tags: Array<{ tag: { nameVi: string; nameEn: string } }>;
};

export function BlogsClient({
  blogs,
  currentPage,
  totalPages,
  canCreate
}: {
  blogs: BlogItem[];
  currentPage: number;
  totalPages: number;
  canCreate?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("blogs");

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const cards: PostCardData[] = blogs.map((b) => ({
    id: b.id,
    slug: b.slug,
    variant: "blog",
    titleVi: b.title,
    summaryVi: b.description,
    thumbnail: b.thumbnail,
    date: b.publishedAt,
    dateLabel: "d MMMM, yyyy",
    author: b.author,
    tags: b.tags.map((t) => t.tag),
    readMoreLabel: t("readMore")
  }));

  return (
    <div className={`transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"}`}>
      {canCreate && (
        <div className='mb-8 flex items-center justify-between rounded-2xl border border-border/50 bg-card p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
              <Pencil className='h-5 w-5 text-primary' />
            </div>
            <div>
              <p className='font-semibold text-sm'>Viết bài mới</p>
              <p className='text-muted-foreground text-xs'>Chia sẻ kiến thức và trải nghiệm của bạn</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Link href='/my-blogs'>
              <Button size='sm' variant='outline'>
                <FileText className='mr-1.5 h-4 w-4' />
                Bài viết của tôi
              </Button>
            </Link>
            <Link href='/blogs/create'>
              <Button size='sm'>
                <Plus className='mr-1.5 h-4 w-4' />
                Tạo bài viết
              </Button>
            </Link>
          </div>
        </div>
      )}

      {blogs.length === 0 ? (
        <div className='py-20 text-center text-muted-foreground'>{t("emptyData")}</div>
      ) : (
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {cards.map((card) => (
            <PostCard data={card} key={card.id} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className='mt-12 flex items-center justify-center gap-2'>
          <Button
            className='h-8 w-8 p-0'
            disabled={currentPage <= 1 || isPending}
            onClick={() => handlePageChange(currentPage - 1)}
            size='sm'
            variant='outline'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-1'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                return (
                  <Button
                    className='h-8 w-8 p-0'
                    disabled={isPending || currentPage === p}
                    key={p}
                    onClick={() => handlePageChange(p)}
                    size='sm'
                    variant={currentPage === p ? "default" : "outline"}
                  >
                    {p}
                  </Button>
                );
              }
              if (p === currentPage - 2 || p === currentPage + 2) {
                return (
                  <span className='flex h-8 w-8 items-center justify-center text-muted-foreground text-sm' key={p}>
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>
          <Button
            className='h-8 w-8 p-0'
            disabled={currentPage >= totalPages || isPending}
            onClick={() => handlePageChange(currentPage + 1)}
            size='sm'
            variant='outline'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
