"use client";

import { type Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DataTablePaginationProps<TData> = {
  table: Table<TData>;
  pageSize: number;
  pageIndex: number;
  pageCount: number;
  canNextPage: boolean;
  canPreviousPage: boolean;
};

export function DataTablePagination<TData>({
  table,
  pageSize,
  pageIndex,
  pageCount,
  canNextPage,
  canPreviousPage
}: DataTablePaginationProps<TData>) {
  return (
    <div className='flex items-center justify-between px-2'>
      <div className='flex-1 text-muted-foreground text-sm'>
        {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} hàng được chọn
      </div>
      <div className='flex items-center space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='font-medium text-sm'>Hiển thị</p>
          <Select onValueChange={(value) => table.setPageSize(Number(value))} value={`${pageSize}`}>
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center font-medium text-sm'>
          Trang {pageIndex + 1} / {pageCount || 1}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            className='hidden size-8 lg:flex'
            disabled={!canPreviousPage}
            onClick={() => table.setPageIndex(0)}
            size='icon'
            variant='outline'
          >
            <ChevronsLeft />
          </Button>
          <Button
            className='size-8'
            disabled={!canPreviousPage}
            onClick={() => table.previousPage()}
            size='icon'
            variant='outline'
          >
            <ChevronLeft />
          </Button>
          <Button
            className='size-8'
            disabled={!canNextPage}
            onClick={() => table.nextPage()}
            size='icon'
            variant='outline'
          >
            <ChevronRight />
          </Button>
          <Button
            className='hidden size-8 lg:flex'
            disabled={!canNextPage}
            onClick={() => table.setPageIndex(pageCount - 1)}
            size='icon'
            variant='outline'
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
