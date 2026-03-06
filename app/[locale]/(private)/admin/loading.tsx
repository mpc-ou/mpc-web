import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic admin loading skeleton — covers all admin sub-routes.
 * Shows: title + subtitle skeleton, toolbar, and a table skeleton with rows.
 */
export default function AdminLoading() {
  return (
    <div className='flex flex-col gap-6'>
      {/* Page header */}
      <div className='flex flex-col gap-1'>
        <Skeleton className='h-8 w-56' />
        <Skeleton className='h-4 w-36' />
      </div>

      {/* Toolbar */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-9 w-64 rounded-md' />
        <Skeleton className='h-9 w-28 rounded-md' />
      </div>

      {/* Table skeleton */}
      <div className='rounded-lg border border-border bg-background'>
        {/* Table header */}
        <div className='flex items-center gap-4 border-border border-b px-4 py-3'>
          <Skeleton className='h-4 w-8' />
          <Skeleton className='h-4 w-40' />
          <Skeleton className='hidden h-4 w-32 sm:block' />
          <Skeleton className='ml-auto hidden h-4 w-24 md:block' />
          <Skeleton className='h-4 w-16' />
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            className='flex items-center gap-4 border-border border-b px-4 py-3 last:border-b-0'
            key={`skeleton-row-${i.toString()}`}
          >
            <Skeleton className='h-4 w-8' />
            <Skeleton className='h-4' style={{ width: `${140 + (i % 3) * 30}px` }} />
            <Skeleton className='hidden h-4 w-28 sm:block' />
            <Skeleton className='ml-auto hidden h-4 w-20 md:block' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-4 w-32' />
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-8 rounded-md' />
          <Skeleton className='h-8 w-8 rounded-md' />
          <Skeleton className='h-8 w-8 rounded-md' />
        </div>
      </div>
    </div>
  );
}
