"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  type Updater,
  useReactTable,
  type VisibilityState
} from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<VisibilityState>>;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  hideToolbar?: boolean;
  pageCount?: number;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  filterComponent,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection: externalRowSelection,
  onRowSelectionChange: externalOnRowSelectionChange,
  hideToolbar = false,
  pageCount
}: DataTableProps<TData, TValue>) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withOptions({ shallow: false }).withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withOptions({ shallow: false }).withDefault(10));

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = React.useState<Record<string, boolean>>({});

  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = externalOnRowSelectionChange ?? setInternalRowSelection;

  const activeColumnVisibility = columnVisibility ?? internalColumnVisibility;
  const activeOnColumnVisibilityChange = onColumnVisibilityChange ?? setInternalColumnVisibility;

  const pagination = React.useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: limit
    }),
    [page, limit]
  );

  const handlePaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      const nextValue = typeof updater === "function" ? updater(pagination) : updater;

      const newPage = nextValue.pageIndex + 1;
      if (page !== newPage) {
        setPage(newPage > 1 ? newPage : null);
      }
      if (limit !== nextValue.pageSize) {
        setLimit(nextValue.pageSize !== 10 ? nextValue.pageSize : null);
      }
    },
    [pagination, page, limit, setPage, setLimit]
  );

  const isServerSide = pageCount !== undefined;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: activeOnColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    manualPagination: isServerSide,
    pageCount: isServerSide ? pageCount : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility: activeColumnVisibility,
      rowSelection,
      pagination
    }
  });

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      {!hideToolbar && (
        <div className='flex items-center gap-2'>
          {searchKey && (
            <Input
              className='max-w-sm'
              onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            />
          )}
          {filterComponent}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='ml-auto hidden h-8 lg:flex' size='sm' variant='outline'>
                <Settings2 className='mr-2 h-4 w-4' />
                Cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px]'>
              <DropdownMenuLabel>Ẩn/hiện cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    checked={col.getIsVisible()}
                    className='capitalize'
                    key={col.id}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className='h-24 text-center' colSpan={columns.length}>
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        canNextPage={table.getCanNextPage()}
        canPreviousPage={table.getCanPreviousPage()}
        pageCount={table.getPageCount()}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        table={table}
      />
    </div>
  );
}
