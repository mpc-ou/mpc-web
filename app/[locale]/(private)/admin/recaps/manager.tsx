"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { adminDeleteRecap, adminGetRecapsPaginated, adminUpdateRecap } from "@/app/_actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatLocalDate } from "@/utils/handle-datetime";
import { createColumns, type RecapRow } from "./columns";

export function RecapsManager() {
  const router = useRouter();
  const { toast } = useToast();
  const locale = useLocale();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [recaps, setRecaps] = useState<RecapRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"TABLE" | "CARD">("TABLE");

  const fetchData = async () => {
    setLoading(true);
    const res = await adminGetRecapsPaginated({
      page,
      limit,
      search
    });
    if (res.data?.payload) {
      const payload = res.data.payload as { recaps: any[]; total: number };
      setRecaps(payload.recaps);
      setTotal(payload.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const handleDelete = async (year: number) => {
    const ok = await confirm({
      title: `Xóa recap năm ${year}?`,
      description: "Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn khỏi hệ thống."
    });
    if (!ok) {
      return;
    }
    const res = await adminDeleteRecap(year);
    if (res.error) {
      toast({ variant: "destructive", description: res.error.message });
      return;
    }
    toast({ variant: "success", description: `Đã xóa recap ${year}` });
    fetchData();
  };

  const handleTogglePublish = async (year: number, isPublished: boolean) => {
    const res = await adminUpdateRecap(year, { isPublished });
    if (res.error) {
      toast({ variant: "destructive", description: res.error.message });
      return;
    }
    toast({
      variant: "success",
      description: isPublished ? `Đã xuất bản recap ${year}` : `Đã hủy xuất bản recap ${year}`
    });
    fetchData();
  };

  const handleViewModeChange = (mode: "TABLE" | "CARD") => {
    setViewMode(mode);
    setLimit(mode === "CARD" ? 24 : 10);
    setPage(1);
  };

  const columns = createColumns(
    (year) => router.push(`/admin/recaps/${year}/edit`),
    handleDelete,
    (year) => window.open(`/recap/${year}`, "_blank"),
    handleTogglePublish
  );

  const table = useReactTable({
    data: recaps,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const pageCount = Math.ceil(total / limit) || 1;

  return (
    <>
      <ConfirmDialog />

      {/* Toolbar Row 2: (empty left) + Action buttons (right) */}
      <div className='flex items-center justify-end gap-2'>
        <Button className='h-9 font-medium' onClick={() => router.push("/admin/recaps/create")}>
          <Plus className='mr-2 h-4 w-4' />
          Tạo Recap mới
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='h-9' variant='outline'>
              Tác vụ khác
              <ChevronDown className='ml-2 h-3 w-3 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44'>
            <DropdownMenuItem onClick={() => alert("Chức năng đang được tích hợp")}>
              <Download className='mr-2 h-4 w-4' />
              Xuất file Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Toolbar Row 3: Search (left) + View mode toggle (right) */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='relative min-w-[200px] max-w-sm flex-1'>
          <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
          <Input
            className='h-9 pl-9 text-xs'
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder='Tìm kiếm recap...'
            value={searchVal}
          />
        </div>

        <div className='flex items-center rounded-lg border bg-muted/40 p-0.5'>
          <Button
            className='h-8 w-8'
            onClick={() => handleViewModeChange("TABLE")}
            size='icon'
            title='Xem dạng bảng'
            variant={viewMode === "TABLE" ? "secondary" : "ghost"}
          >
            <List className='h-4 w-4' />
          </Button>
          <Button
            className='h-8 w-8'
            onClick={() => handleViewModeChange("CARD")}
            size='icon'
            title='Xem dạng lưới (Card)'
            variant={viewMode === "CARD" ? "secondary" : "ghost"}
          >
            <LayoutGrid className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Main Content Area: Table vs Cards */}
      <div className='relative min-h-[300px]'>
        {loading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='h-6 w-6 animate-spin text-primary' />
              <p className='text-muted-foreground text-xs'>Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {viewMode === "TABLE" ? (
          <div className='overflow-hidden rounded-xl border bg-background/50 backdrop-blur-xs'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead className='text-xs' key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell className='py-3 text-xs' key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className='h-24 text-center text-muted-foreground text-xs' colSpan={columns.length}>
                      Chưa có recap nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {recaps.length > 0 ? (
              recaps.map((recap) => (
                <div
                  className='group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-xs transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                  key={recap.year}
                >
                  <div className='absolute top-[-3px] left-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
                  <div className='absolute top-[-3px] right-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
                  <div className='absolute bottom-[-3px] left-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
                  <div className='absolute right-[-3px] bottom-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />

                  <div className='space-y-3'>
                    <div className='relative aspect-video w-full overflow-hidden rounded-lg border border-white/5 bg-muted'>
                      {recap.coverImage ? (
                        <img
                          alt={recap.name}
                          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                          src={recap.coverImage}
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center bg-slate-950 font-black font-mono text-primary text-xl'>
                          {recap.year}
                        </div>
                      )}
                      <div className='absolute top-2 left-2 flex flex-col gap-1'>
                        <Badge className='border-primary/30 bg-primary/20 text-primary' variant='outline'>
                          Năm {recap.year}
                        </Badge>
                      </div>
                      <div className='absolute top-2 right-2'>
                        <Badge className='text-[10px]' variant={recap.isPublished ? "default" : "secondary"}>
                          {recap.isPublished ? "Đã xuất bản" : "Nháp"}
                        </Badge>
                      </div>
                    </div>

                    <div className='space-y-1'>
                      <h3 className='line-clamp-1 font-bold text-foreground text-sm transition-colors group-hover:text-primary'>
                        {recap.name}
                      </h3>
                      <p className='line-clamp-2 min-h-[2rem] text-muted-foreground text-xs'>
                        {recap.description || "—"}
                      </p>
                    </div>
                  </div>

                  <div className='mt-4 flex items-center justify-between border-white/5 border-t pt-3 text-[10px] text-muted-foreground'>
                    <span>{formatLocalDate(recap.createdAt, locale)}</span>
                    <div className='flex items-center gap-1.5'>
                      <Button
                        className='h-7 w-7'
                        onClick={() => window.open(`/recap/${recap.year}`, "_blank")}
                        size='icon'
                        title='Xem Recap'
                        variant='ghost'
                      >
                        <ExternalLink className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        className='h-7 w-7 text-blue-400 hover:text-blue-500'
                        onClick={() => router.push(`/admin/recaps/${recap.year}/edit`)}
                        size='icon'
                        title='Chỉnh sửa'
                        variant='ghost'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        className='h-7 w-7'
                        onClick={() => handleTogglePublish(recap.year, !recap.isPublished)}
                        size='icon'
                        title={recap.isPublished ? "Hủy xuất bản" : "Xuất bản"}
                        variant='ghost'
                      >
                        {recap.isPublished ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}
                      </Button>
                      <Button
                        className='h-7 w-7 text-destructive hover:text-destructive/80'
                        onClick={() => handleDelete(recap.year)}
                        size='icon'
                        title='Xóa'
                        variant='ghost'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-full py-12 text-center text-muted-foreground text-xs'>
                Không tìm thấy recap nào.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className='mt-6 flex items-center justify-between border-border/40 border-t px-2 pt-4'>
        <div className='text-muted-foreground text-xs'>
          Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, total)} trong số {total} mục
        </div>

        <div className='flex items-center space-x-6 lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <p className='font-medium text-xs'>Số hàng mỗi trang</p>
            <Select
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
              value={`${limit}`}
            >
              <SelectTrigger className='h-8 w-[70px] text-xs'>
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent side='top'>
                {(viewMode === "CARD" ? [24, 48, 96] : [10, 20, 30, 50]).map((size) => (
                  <SelectItem className='text-xs' key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex w-[80px] items-center justify-center font-medium text-xs'>
            Trang {page} / {pageCount}
          </div>

          <div className='flex items-center space-x-1'>
            <Button
              className='hidden size-8 lg:flex'
              disabled={page === 1 || loading}
              onClick={() => setPage(1)}
              size='icon'
              variant='outline'
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              className='size-8'
              disabled={page === 1 || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              size='icon'
              variant='outline'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              className='size-8'
              disabled={page === pageCount || loading}
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
              size='icon'
              variant='outline'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              className='hidden size-8 lg:flex'
              disabled={page === pageCount || loading}
              onClick={() => setPage(pageCount)}
              size='icon'
              variant='outline'
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
