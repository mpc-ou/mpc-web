import { Film } from "lucide-react";
import { connection } from "next/server";
import { Suspense } from "react";
import { getPublishedRecaps } from "@/app/[locale]/actions/recaps";
import { ScrollReveal } from "@/components/ui/scroll-reveal.client";
import { Link } from "@/configs/i18n/routing";

export default function RecapListPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-background' />}>
      <RecapListContent />
    </Suspense>
  );
}

async function RecapListContent() {
  await connection();
  const { data } = await getPublishedRecaps();
  const recaps = (data?.payload as any)?.recaps ?? [];

  return (
    <div className='min-h-screen bg-background'>
      {/* Minimal nav */}
      <nav className='sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md'>
        <div className='container mx-auto flex h-14 items-center justify-between px-4'>
          <Link className='text-muted-foreground text-sm transition-colors hover:text-primary' href='/'>
            ← Trang chủ
          </Link>
          <span className='font-semibold'>Year Recap</span>
          <div className='w-20' />
        </div>
      </nav>

      <div className='container mx-auto max-w-5xl px-4 py-16'>
        <ScrollReveal className='mb-12 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <Film className='h-8 w-8' />
          </div>
          <h1 className='mb-3 font-black text-4xl tracking-tight sm:text-5xl'>Year Recap</h1>
          <p className='mx-auto max-w-xl text-lg text-muted-foreground'>
            Nhìn lại hành trình hoạt động của CLB qua từng năm
          </p>
        </ScrollReveal>

        {recaps.length === 0 ? (
          <div className='py-20 text-center text-muted-foreground'>Chưa có recap nào được xuất bản.</div>
        ) : (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {recaps.map((recap: any) => (
              <Link
                className='group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg'
                href={`/recap/${recap.year}` as any}
                key={recap.year}
              >
                <div className='relative aspect-video overflow-hidden bg-muted'>
                  {recap.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={recap.name}
                      className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      src={recap.coverImage}
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <Film className='h-12 w-12 text-muted-foreground/30' />
                    </div>
                  )}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
                  <div className='absolute right-0 bottom-0 left-0 p-5'>
                    <span className='mb-1 inline-block rounded-full bg-primary/90 px-3 py-1 font-bold text-primary-foreground text-sm'>
                      {recap.year}
                    </span>
                    <h2 className='font-bold text-lg text-white drop-shadow-md'>{recap.name}</h2>
                  </div>
                </div>
                {recap.description && (
                  <div className='p-4'>
                    <p className='line-clamp-2 text-muted-foreground text-sm'>{recap.description}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
