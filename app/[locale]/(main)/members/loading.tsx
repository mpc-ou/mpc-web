import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
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

      {/* Members List Grouped by Year Skeleton */}
      <div className='container mx-auto mt-20 max-w-7xl space-y-16 px-4'>
        {[2024, 2023].map((year) => (
          <div className='space-y-8' key={year}>
            {/* Year Header */}
            <div className='flex items-center gap-4'>
              <Skeleton className='h-8 w-16 rounded' />
              <div className='h-[1px] flex-1 bg-border/40' />
              <Skeleton className='h-5 w-28 rounded' />
            </div>

            {/* Members Cards Grid */}
            <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  className='flex flex-col items-center space-y-4 rounded-2xl border border-border/40 bg-card/20 p-5 text-center shadow-xs backdrop-blur-xs'
                  key={i}
                >
                  {/* Avatar Circle */}
                  <Skeleton className='h-20 w-20 rounded-full' />
                  {/* Name & Role */}
                  <div className='flex w-full flex-col items-center space-y-2'>
                    <Skeleton className='h-5 w-3/4 rounded' />
                    <Skeleton className='h-4 w-1/2 rounded' />
                  </div>
                  {/* Generation Badge */}
                  <Skeleton className='h-6 w-20 rounded-full' />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
