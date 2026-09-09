import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className='min-h-screen w-full animate-pulse bg-background pb-20'>
      {/* Hero Section Skeleton */}
      <div className='w-full border-border/40 border-b bg-muted/10 py-16 lg:py-24'>
        <div className='container mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2'>
          <div className='flex flex-col items-center space-y-6 text-center lg:items-start lg:text-left'>
            <Skeleton className='h-6 w-36 rounded-full' />
            <Skeleton className='h-12 w-80 rounded-lg' />
            <div className='flex w-full flex-col items-center space-y-3 lg:items-start'>
              <Skeleton className='h-4.5 w-full max-w-[480px]' />
              <Skeleton className='h-4.5 w-5/6 max-w-[400px]' />
            </div>
          </div>
          <div className='relative mx-auto aspect-video w-full max-w-[450px] rounded-2xl border border-border/40 bg-card/25 p-4 shadow-sm backdrop-blur-xs'>
            <div className='mb-3 flex gap-1.5'>
              <Skeleton className='h-3 w-3 rounded-full' />
              <Skeleton className='h-3 w-3 rounded-full' />
              <Skeleton className='h-3 w-3 rounded-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-3.5 w-full' />
              <Skeleton className='h-3.5 w-[85%]' />
              <Skeleton className='h-3.5 w-[65%]' />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid Section */}
      <div className='container mx-auto mt-16 max-w-6xl space-y-12 px-4'>
        {/* Filter bar skeleton */}
        <div className='flex flex-wrap items-center justify-between gap-4 border-border/30 border-b pb-6'>
          <div className='flex gap-3'>
            <Skeleton className='h-10 w-20 rounded-md' />
            <Skeleton className='h-10 w-24 rounded-md' />
            <Skeleton className='h-10 w-28 rounded-md' />
          </div>
          <Skeleton className='h-10 w-48 rounded-md' />
        </div>

        {/* Projects Cards Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              className='space-y-5 rounded-2xl border border-border/50 bg-card/30 p-5 shadow-xs backdrop-blur-xs'
              key={i}
            >
              {/* Project Image */}
              <div className='relative aspect-video w-full overflow-hidden rounded-xl bg-muted'>
                <Skeleton className='h-full w-full' />
              </div>
              {/* Project Title & Desc */}
              <div className='space-y-3'>
                <Skeleton className='h-6 w-3/4 rounded' />
                <div className='space-y-2'>
                  <Skeleton className='h-3.5 w-full' />
                  <Skeleton className='h-3.5 w-[90%]' />
                </div>
              </div>
              {/* Tech Tags */}
              <div className='flex flex-wrap gap-2 border-border/30 border-t pt-2'>
                <Skeleton className='h-6 w-16 rounded-full' />
                <Skeleton className='h-6 w-14 rounded-full' />
                <Skeleton className='h-6 w-20 rounded-full' />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className='flex justify-center gap-2 pt-8'>
          <Skeleton className='h-10 w-10 rounded-md' />
          <Skeleton className='h-10 w-10 rounded-md' />
          <Skeleton className='h-10 w-10 rounded-md' />
        </div>
      </div>
    </div>
  );
}
