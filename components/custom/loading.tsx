import { Skeleton } from "../ui/skeleton";

const MainContentSkeleton = () => (
  <div className='container mx-auto max-w-6xl animate-pulse space-y-20 px-4 py-12 lg:py-20'>
    {/* Hero Section Skeleton */}
    <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8'>
      {/* Left Text Column */}
      <div className='flex flex-col items-center justify-center gap-6 text-center lg:items-start lg:text-left'>
        {/* Badge */}
        <Skeleton className='h-6 w-28 rounded-full' />
        {/* Title */}
        <div className='flex w-full flex-col items-center space-y-3 lg:items-start'>
          <Skeleton className='h-10 w-[85%] rounded-lg sm:h-12' />
          <Skeleton className='h-10 w-[60%] rounded-lg sm:h-12' />
        </div>
        {/* Subtitle */}
        <div className='flex w-full flex-col items-center space-y-2.5 lg:items-start'>
          <Skeleton className='h-4 w-full max-w-[450px]' />
          <Skeleton className='h-4 w-11/12 max-w-[420px]' />
          <Skeleton className='h-4 w-3/4 max-w-[350px]' />
        </div>
        {/* Buttons */}
        <div className='flex flex-wrap justify-center gap-4 pt-2 lg:justify-start'>
          <Skeleton className='h-12 w-36 rounded-full' />
          <Skeleton className='h-12 w-32 rounded-full' />
        </div>
      </div>

      {/* Right Column (Visual/Image) */}
      <div className='flex items-center justify-center'>
        <div className='relative aspect-square w-full max-w-[280px] rounded-3xl border border-border/40 bg-card/20 p-4 shadow-sm backdrop-blur-xs sm:max-w-[340px]'>
          <Skeleton className='h-full w-full rounded-2xl' />
        </div>
      </div>
    </div>

    {/* Divider */}
    <div className='w-full border-border/30 border-t' />

    {/* Cards Section Skeleton */}
    <div className='space-y-12'>
      <div className='flex flex-col items-center gap-3 text-center'>
        <Skeleton className='h-5 w-24 rounded-full' />
        <Skeleton className='h-8 w-64 rounded-md' />
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div
            className='space-y-5 rounded-2xl border border-border/50 bg-card/30 p-6 shadow-xs backdrop-blur-xs'
            key={i}
          >
            <Skeleton className='h-12 w-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/5' />
            <div className='space-y-2'>
              <Skeleton className='h-5 w-2/5' />
              <Skeleton className='h-3.5 w-full' />
              <Skeleton className='h-3.5 w-[90%]' />
              <Skeleton className='h-3.5 w-[75%]' />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PageLayoutSkeleton = () => (
  <div className='flex h-screen w-screen flex-col overflow-hidden'>
    {/* Header Skeleton */}
    <header className='sticky top-0 z-50 h-14 border-border border-b bg-background/80 backdrop-blur-md'>
      <div className='container mx-auto flex h-full items-center justify-between px-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-8 w-8 rounded-lg' />
          <Skeleton className='h-5 w-24 rounded-md' />
        </div>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-8 w-16 rounded-lg' />
          <Skeleton className='h-8 w-8 rounded-full' />
        </div>
      </div>
    </header>

    {/* Main Content Skeleton */}
    <main className='flex-1 overflow-y-auto bg-background'>
      <MainContentSkeleton />
    </main>

    {/* Footer Skeleton */}
    <footer className='border-border border-t bg-background/50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='flex flex-col gap-3'>
            <Skeleton className='h-6 w-24' />
            <Skeleton className='h-3.5 w-48' />
            <Skeleton className='h-3.5 w-40' />
          </div>
          <div className='flex flex-col gap-2.5'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-3.5 w-32' />
            <Skeleton className='h-3.5 w-28' />
          </div>
          <div className='flex flex-col gap-2.5'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-3.5 w-32' />
            <Skeleton className='h-3.5 w-28' />
          </div>
        </div>
      </div>
    </footer>
  </div>
);

const LoadingPage = () => (
  <section className='flex min-h-[80vh] w-full flex-col items-center justify-center bg-background'>
    <MainContentSkeleton />
  </section>
);

const LoadingComponent = () => (
  <div className='relative flex w-full flex-col items-center justify-center px-4 py-10'>
    <div className='flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 px-4 py-2.5 shadow-xs backdrop-blur-xs'>
      <div className='relative h-5 w-5'>
        <div className='absolute inset-0 rounded-full border-2 border-muted' />
        <div className='absolute inset-0 animate-spin rounded-full border-2 border-t-orange-500' />
      </div>
      <span className='animate-pulse font-medium text-muted-foreground text-sm tracking-wide'>Loading...</span>
    </div>
  </div>
);

export { LoadingComponent, LoadingPage, PageLayoutSkeleton };
