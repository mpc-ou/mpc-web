import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className='min-h-[90vh] w-full animate-pulse space-y-24 bg-background py-12 lg:py-20'>
      {/* Hero Section Skeleton */}
      <div className='container mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2 lg:gap-8'>
        {/* Left Text */}
        <div className='flex flex-col items-center gap-6 text-center lg:items-start lg:text-left'>
          <Skeleton className='h-6 w-32 rounded-full' />
          <div className='flex w-full flex-col items-center space-y-3 lg:items-start'>
            <Skeleton className='h-12 w-[90%] rounded-lg sm:h-14' />
            <Skeleton className='h-12 w-[70%] rounded-lg sm:h-14' />
          </div>
          <div className='flex w-full flex-col items-center space-y-2.5 lg:items-start'>
            <Skeleton className='h-4.5 w-full max-w-[500px]' />
            <Skeleton className='h-4.5 w-11/12 max-w-[460px]' />
            <Skeleton className='h-4.5 w-3/4 max-w-[380px]' />
          </div>
        </div>

        {/* Right - Dual Glassy Windows Skeleton */}
        <div className='relative flex min-h-[360px] items-center justify-center sm:min-h-[440px]'>
          {/* Back Window */}
          <div className='absolute aspect-video w-4/5 -translate-x-8 -translate-y-8 rounded-2xl border border-border/40 bg-card/10 p-3 opacity-60 shadow-md backdrop-blur-xs'>
            <div className='mb-3 flex gap-1.5'>
              <Skeleton className='h-3.5 w-3.5 rounded-full' />
              <Skeleton className='h-3.5 w-3.5 rounded-full' />
              <Skeleton className='h-3.5 w-3.5 rounded-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-3 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
              <Skeleton className='h-3 w-2/3' />
            </div>
          </div>
          {/* Front Window */}
          <div className='absolute aspect-video w-4/5 translate-x-8 translate-y-8 rounded-2xl border border-border/50 bg-card/25 p-4 shadow-lg backdrop-blur-md'>
            <div className='mb-3 flex gap-1.5'>
              <Skeleton className='h-3.5 w-3.5 rounded-full' />
              <Skeleton className='h-3.5 w-3.5 rounded-full' />
              <Skeleton className='h-3.5 w-3.5 rounded-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-3 w-full' />
              <Skeleton className='h-3 w-[85%]' />
              <Skeleton className='h-3 w-[60%]' />
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Purpose Skeleton */}
      <div className='border-border/40 border-t bg-muted/5 py-20'>
        <div className='container mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 md:grid-cols-2'>
          <div className='space-y-6'>
            <Skeleton className='h-8 w-48 rounded' />
            <div className='space-y-3.5'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-11/12' />
              <Skeleton className='h-4 w-5/6' />
            </div>
          </div>
          <div className='space-y-6'>
            <Skeleton className='h-8 w-48 rounded' />
            <div className='space-y-3.5'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-11/12' />
              <Skeleton className='h-4 w-5/6' />
            </div>
          </div>
        </div>
      </div>

      {/* Departments Carousel Skeleton */}
      <div className='container mx-auto max-w-7xl space-y-12 px-4'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <Skeleton className='h-6 w-36 rounded-full' />
          <Skeleton className='h-10 w-80 rounded-md' />
        </div>
        <div className='relative aspect-video w-full rounded-3xl border border-border/40 bg-card/20 p-6 shadow-sm backdrop-blur-xs'>
          <div className='absolute bottom-6 left-6 space-y-3'>
            <Skeleton className='h-8 w-64 rounded' />
            <Skeleton className='h-4 w-96 rounded' />
          </div>
          <div className='absolute right-6 bottom-6 flex gap-3'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <Skeleton className='h-12 w-12 rounded-full' />
          </div>
        </div>
      </div>

      {/* Shirt Model Section Skeleton */}
      <div className='border-border/40 border-y bg-muted/5 py-20'>
        <div className='container mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2'>
          <div className='flex flex-col items-center space-y-6 text-center lg:items-start lg:text-left'>
            <Skeleton className='h-6 w-28 rounded-full' />
            <Skeleton className='h-12 w-72 rounded-lg' />
            <div className='w-full space-y-3.5'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-[85%]' />
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='aspect-square w-full max-w-[400px] rounded-3xl border border-border/40 bg-card/20 p-4 shadow-sm backdrop-blur-xs'>
              <Skeleton className='h-full w-full rounded-2xl' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
