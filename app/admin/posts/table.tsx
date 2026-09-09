"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings2,
  Trash2,
  Trophy
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { adminDeletePost, adminDeletePosts } from "@/app/_actions/admin";
import { useHandleError } from "@/app/admin/_hooks/use-handle-error";
import { AdminViewDialog } from "@/components/custom/admin-view-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { getFullName } from "@/lib/utils";
import { formatLocalDate } from "@/utils/handle-datetime";
import { createColumns, type PostRow } from "./columns";

const POST_TYPE_META: Record<string, { className: string; label: string }> = {
  BLOG: { className: "border-info/20 bg-info/10 text-info", label: "Bài viết" },
  EVENT: { className: "border-success/20 bg-success/10 text-success", label: "Sự kiện" }
};
const POST_TYPE_FALLBACK = { className: "border-warning/20 bg-warning/10 text-warning", label: "Thành tựu" };

const POST_TYPE_CARD_META: Record<string, { className: string; label: string }> = {
  BLOG: { className: "border-info/30 bg-info/20 text-info", label: "Bài viết" },
  EVENT: { className: "border-success/30 bg-success/20 text-success", label: "Sự kiện" }
};
const POST_TYPE_CARD_FALLBACK = { className: "border-warning/30 bg-warning/20 text-warning", label: "Thành tựu" };

export function PostsDataTable({
  locale,
  initialPosts,
  initialTotalCount,
  initialTotalPages
}: {
  locale: string;
  initialPosts: PostRow[];
  initialTotalCount: number;
  initialTotalPages: number;
}) {
  const router = useRouter();
  const { handleErrorClient, toast } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isPending, startTransition] = useTransition();

  const [viewPost, setViewPost] = useState<PostRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"TABLE" | "CARD">("TABLE");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // URL States driven via nuqs (shallow: false to trigger server component refetch)
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withOptions({ shallow: false, startTransition }).withDefault(1)
  );

  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withOptions({ shallow: false, startTransition }).withDefault(10)
  );

  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    startTransition
  });

  const [typeFilter, setTypeFilter] = useQueryState("type", {
    defaultValue: "ALL",
    shallow: false,
    startTransition
  });

  const [statusFilter, setStatusFilter] = useQueryState("status", {
    defaultValue: "PUBLISHED",
    shallow: false,
    startTransition
  });

  // Local state for debounced search input
  const [searchVal, setSearchVal] = useState(search);

  // Sync local searchVal with URL search state
  useEffect(() => {
    setSearchVal(search);
  }, [search]);

  // Debounce search val to URL state
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchVal !== search) {
        setSearch(searchVal || null);
        setPage(null); // Reset page to 1
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal, search, setSearch, setPage]);

  const posts = initialPosts;
  const total = initialTotalCount;
  const pageCount = initialTotalPages;
  const loading = isPending || actionLoading;

  const handleEdit = useCallback(
    (post: PostRow) => {
      router.push(`/admin/posts/${post.id}/edit`);
    },
    [router]
  );

  const handleView = useCallback(
    (post: PostRow) => {
      if (post.status === "PUBLISHED") {
        window.open(`/${locale}/blogs/${post.slug}`, "_blank");
      } else {
        setViewPost(post);
      }
    },
    [locale]
  );

  const handleDelete = useCallback(
    async (id: string, type: "BLOG" | "EVENT" | "ACHIEVEMENT") => {
      const ok = await confirm({
        title: "Xóa nội dung?",
        description: "Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn khỏi hệ thống."
      });
      if (!ok) {
        return;
      }
      setActionLoading(true);
      await handleErrorClient({
        cb: () => adminDeletePost(id, type),
        onSuccess: () => {
          setRowSelection({});
          router.refresh();
        }
      });
      setActionLoading(false);
    },
    [confirm, handleErrorClient, router]
  );

  const handleBulkDelete = async () => {
    const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id);
    if (selectedIds.length === 0) {
      return;
    }

    const ok = await confirm({
      title: `Xóa ${selectedIds.length} nội dung đã chọn?`,
      description: "Hành động này không thể hoàn tác và sẽ xóa vĩnh viễn chúng khỏi hệ thống."
    });
    if (!ok) {
      return;
    }

    setActionLoading(true);
    await handleErrorClient({
      cb: () => adminDeletePosts(selectedIds),
      onSuccess: () => {
        setRowSelection({});
        router.refresh();
      }
    });
    setActionLoading(false);
  };

  const handleViewModeChange = (mode: "TABLE" | "CARD") => {
    setViewMode(mode);
    setLimit(mode === "CARD" ? 24 : 10);
    setPage(null); // Reset page to 1
  };

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleView, locale),
    [handleDelete, handleEdit, handleView, locale]
  );

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      rowSelection
    }
  });

  const selectedCount = Object.keys(rowSelection).length;

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: building dynamic post detail fields
  const viewFields = useMemo(() => {
    if (!viewPost) {
      return [];
    }

    const base = [
      { label: "Tiêu đề", value: viewPost.title, colSpan: 2 as const },
      { label: "Đường dẫn (Slug)", value: viewPost.slug, colSpan: 2 as const },
      {
        label: "Loại nội dung",
        value: (() => {
          const meta = POST_TYPE_META[viewPost.type] ?? POST_TYPE_FALLBACK;
          return (
            <Badge className={meta.className} variant='outline'>
              {meta.label}
            </Badge>
          );
        })()
      },
      {
        label: "Trạng thái",
        value: <Badge variant='outline'>{viewPost.status}</Badge>
      },
      {
        label: "Tác giả",
        value: viewPost.author
          ? getFullName(viewPost.author.firstName, viewPost.author.middleName, viewPost.author.lastName, "vi")
          : "—"
      },
      {
        label: "Ngày tạo",
        value: new Date(viewPost.createdAt).toLocaleString("vi-VN")
      },
      {
        label: "Ngày xuất bản",
        value: viewPost.publishedAt ? new Date(viewPost.publishedAt).toLocaleString("vi-VN") : "—"
      },
      { label: "Tóm tắt", value: viewPost.summary || "—", colSpan: 2 as const }
    ];

    if (viewPost.type === "EVENT") {
      return [
        ...base,
        { label: "Địa điểm", value: viewPost.locationVi || "—" },
        {
          label: "Trạng thái sự kiện",
          value: <Badge variant='outline'>{viewPost.eventStatus || "—"}</Badge>
        },
        { label: "Loại sự kiện", value: viewPost.eventType || "—" },
        {
          label: "Bắt đầu",
          value: viewPost.startAt ? new Date(viewPost.startAt).toLocaleString("vi-VN") : "—"
        },
        {
          label: "Kết thúc",
          value: viewPost.endAt ? new Date(viewPost.endAt).toLocaleString("vi-VN") : "—"
        },
        {
          label: "Ảnh bìa (Thumbnail)",
          value: viewPost.thumbnail ? (
            <div className='relative aspect-video max-h-40 overflow-hidden rounded-md border bg-muted'>
              <Image alt='Thumbnail' className='object-cover' fill sizes='400px' src={viewPost.thumbnail} />
            </div>
          ) : (
            "—"
          ),
          colSpan: 2 as const
        },
        {
          label: "Hình ảnh sự kiện bổ sung",
          value:
            viewPost.images && viewPost.images.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {viewPost.images.map((img, idx) => (
                  <div className='relative h-16 w-24 overflow-hidden rounded-md border bg-muted' key={img}>
                    <Image alt={`Event image ${idx}`} className='object-cover' fill sizes='96px' src={img} />
                  </div>
                ))}
              </div>
            ) : (
              "—"
            ),
          colSpan: 2 as const
        }
      ];
    }

    if (viewPost.type === "ACHIEVEMENT") {
      return [
        ...base,
        {
          label: "Ảnh đại diện (Thumbnail)",
          value: viewPost.thumbnail ? (
            <div className='relative aspect-video max-h-40 overflow-hidden rounded-md border bg-muted'>
              <Image alt='Thumbnail' className='object-cover' fill sizes='400px' src={viewPost.thumbnail} />
            </div>
          ) : (
            "—"
          ),
          colSpan: 2 as const
        },
        {
          label: "Bộ sưu tập ảnh",
          value:
            viewPost.images && viewPost.images.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {viewPost.images.map((img, idx) => (
                  <div className='relative h-16 w-24 overflow-hidden rounded-md border bg-muted' key={img}>
                    <Image alt={`Achievement image ${idx}`} className='object-cover' fill sizes='96px' src={img} />
                  </div>
                ))}
              </div>
            ) : (
              "—"
            ),
          colSpan: 2 as const
        }
      ];
    }

    return base;
  }, [viewPost]);

  return (
    <>
      <ConfirmDialog />

      {/* Toolbar Row 2: Bulk Operations & Action Buttons */}
      <div className='flex w-full items-center justify-between gap-2'>
        {/* Bulk operations on the left */}
        <div className='flex items-center gap-2'>
          {selectedCount > 0 && (
            <div className='flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-destructive-foreground text-xs'>
              <span className='font-medium text-destructive'>Đã chọn {selectedCount} dòng</span>
              <Button
                className='h-7 cursor-pointer px-2.5 text-[11px]'
                onClick={handleBulkDelete}
                size='sm'
                variant='destructive'
              >
                <Trash2 className='mr-1.5 h-3.5 w-3.5' />
                Xóa hàng loạt
              </Button>
            </div>
          )}
        </div>

        {/* Action buttons on the right */}
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='h-9 cursor-pointer font-medium'>
                <Plus className='mr-2 h-4 w-4' />
                Tạo mới
                <ChevronDown className='ml-2 h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 rounded-md border border-border bg-popover shadow-md'>
              <DropdownMenuItem className='cursor-pointer' onClick={() => router.push("/admin/posts/new?type=BLOG")}>
                <BookOpen className='mr-2 h-4 w-4 text-purple-400' />
                Bài viết (Blog)
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer' onClick={() => router.push("/admin/posts/new?type=EVENT")}>
                <Calendar className='mr-2 h-4 w-4 text-green-400' />
                Sự kiện
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() => router.push("/admin/posts/new?type=ACHIEVEMENT")}
              >
                <Trophy className='mr-2 h-4 w-4 text-amber-400' />
                Thành tựu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='h-9 cursor-pointer' variant='outline'>
                Tác vụ khác
                <ChevronDown className='ml-2 h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44 rounded-md border border-border bg-popover shadow-md'>
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() =>
                  toast({
                    title: "Chức năng đang được tích hợp",
                    variant: "info"
                  })
                }
              >
                <Download className='mr-2 h-4 w-4' />
                Xuất file Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toolbar Row 3: Search (left) + Filters & Controls (right) */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        {/* Search */}
        <div className='relative min-w-[200px] max-w-sm flex-1'>
          <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
          <Input
            className='h-9 pl-9 text-xs'
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder='Tìm theo tiêu đề...'
            value={searchVal}
          />
        </div>

        {/* Filters and Controls */}
        <div className='flex flex-wrap items-center gap-2'>
          <Select
            onValueChange={(val) => {
              setTypeFilter(val !== "ALL" ? val : null);
              setPage(null);
            }}
            value={typeFilter}
          >
            <SelectTrigger className='h-9 w-36 cursor-pointer text-xs'>
              <SelectValue placeholder='Lọc loại' />
            </SelectTrigger>
            <SelectContent className='border border-border bg-popover'>
              <SelectItem className='cursor-pointer' value='ALL'>
                Tất cả loại
              </SelectItem>
              <SelectItem className='cursor-pointer' value='BLOG'>
                Bài viết (Blog)
              </SelectItem>
              <SelectItem className='cursor-pointer' value='EVENT'>
                Sự kiện
              </SelectItem>
              <SelectItem className='cursor-pointer' value='ACHIEVEMENT'>
                Thành tựu
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            onValueChange={(val) => {
              setStatusFilter(val !== "PUBLISHED" ? val : null);
              setPage(null);
            }}
            value={statusFilter}
          >
            <SelectTrigger className='h-9 w-36 cursor-pointer text-xs'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent className='border border-border bg-popover'>
              <SelectItem className='cursor-pointer' value='ALL'>
                Tất cả trạng thái
              </SelectItem>
              <SelectItem className='cursor-pointer' value='DRAFT'>
                Nháp
              </SelectItem>
              <SelectItem className='cursor-pointer' value='PENDING_REVIEW'>
                Chờ duyệt
              </SelectItem>
              <SelectItem className='cursor-pointer' value='PUBLISHED'>
                Đã xuất bản
              </SelectItem>
              <SelectItem className='cursor-pointer' value='ARCHIVED'>
                Lưu trữ
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='h-9 cursor-pointer' size='sm' variant='outline'>
                <Settings2 className='mr-2 h-4 w-4' />
                Cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[150px] rounded-md border border-border bg-popover shadow-md'>
              <DropdownMenuLabel>Ẩn/hiện cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    checked={col.getIsVisible()}
                    className='cursor-pointer text-xs capitalize'
                    key={col.id}
                    onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View mode toggle */}
          <div className='flex items-center rounded-lg border bg-muted/40 p-0.5'>
            <Button
              className='h-8 w-8 cursor-pointer'
              onClick={() => handleViewModeChange("TABLE")}
              size='icon'
              title='Xem dạng bảng'
              variant={viewMode === "TABLE" ? "secondary" : "ghost"}
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              className='h-8 w-8 cursor-pointer'
              onClick={() => handleViewModeChange("CARD")}
              size='icon'
              title='Xem dạng lưới (Card)'
              variant={viewMode === "CARD" ? "secondary" : "ghost"}
            >
              <LayoutGrid className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table vs Cards */}
      <div className='relative mt-6 min-h-[300px]'>
        {loading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-[1px] transition-all duration-300'>
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <span className='animate-pulse font-medium text-muted-foreground text-xs'>Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        <div
          className={
            loading
              ? "pointer-events-none opacity-60 transition-opacity duration-300"
              : "transition-opacity duration-300"
          }
        >
          {viewMode === "TABLE" ? (
            <div className='overflow-hidden rounded-xl border bg-background/50 backdrop-blur-xs'>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((header) => (
                        <TableHead className='font-semibold text-xs' key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                          <TableCell className='py-3 text-xs' key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className='h-24 text-center text-muted-foreground text-xs' colSpan={columns.length}>
                        Không tìm thấy nội dung phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    className='group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-xs transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                    key={post.id}
                  >
                    <div className='absolute top-[-3px] left-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
                    <div className='absolute top-[-3px] right-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
                    <div className='absolute bottom-[-3px] left-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />
                    <div className='absolute right-[-3px] bottom-[-3px] h-1.5 w-1.5 border border-orange-500 bg-white opacity-0 transition-opacity group-hover:opacity-100' />

                    <div className='space-y-3'>
                      <div className='relative aspect-video w-full overflow-hidden rounded-lg border border-white/5 bg-muted'>
                        {post.thumbnail ? (
                          <Image
                            alt={post.title}
                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                            fill
                            sizes='(min-width: 1024px) 25vw, 50vw'
                            src={post.thumbnail}
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center bg-slate-950 font-mono text-[10px] text-muted-foreground'>
                            [NO THUMBNAIL]
                          </div>
                        )}
                        <div className='absolute top-2 left-2 flex flex-col gap-1'>
                          <Badge
                            className={(POST_TYPE_CARD_META[post.type] ?? POST_TYPE_CARD_FALLBACK).className}
                            variant='outline'
                          >
                            {(POST_TYPE_CARD_META[post.type] ?? POST_TYPE_CARD_FALLBACK).label}
                          </Badge>
                        </div>
                        <div className='absolute top-2 right-2'>
                          <Badge className='bg-slate-950/85 text-[10px] backdrop-blur-xs' variant='outline'>
                            {post.status}
                          </Badge>
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <h3 className='line-clamp-1 font-bold text-foreground text-sm transition-colors group-hover:text-primary'>
                          {post.title}
                        </h3>
                        <p className='line-clamp-2 min-h-[2rem] text-muted-foreground text-xs'>{post.summary || "—"}</p>
                      </div>
                    </div>

                    <div className='mt-4 flex items-center justify-between border-white/5 border-t pt-3 text-[10px] text-muted-foreground'>
                      <span>{formatLocalDate(post.createdAt, locale)}</span>
                      <div className='flex items-center gap-1.5'>
                        <Button
                          className='h-7 w-7 cursor-pointer'
                          onClick={() => handleView(post)}
                          size='icon'
                          variant='ghost'
                        >
                          <Eye className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          className='h-7 w-7 cursor-pointer text-blue-400 hover:text-blue-500'
                          onClick={() => handleEdit(post)}
                          size='icon'
                          variant='ghost'
                        >
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          className='h-7 w-7 cursor-pointer text-destructive hover:text-destructive/80'
                          onClick={() => handleDelete(post.id, post.type)}
                          size='icon'
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
                  Không tìm thấy nội dung phù hợp.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className='mt-6 flex items-center justify-between border-border/40 border-t px-2 pt-4'>
        <div className='text-muted-foreground text-xs'>
          Hiển thị {total > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, total)} trong số {total} mục
        </div>

        <div className='flex items-center space-x-6 lg:space-x-8'>
          <div className='flex items-center space-x-2'>
            <p className='font-medium text-xs'>Số hàng mỗi trang</p>
            <Select
              onValueChange={(value) => {
                setLimit(Number(value) !== 10 ? Number(value) : null);
                setPage(null);
              }}
              value={`${limit}`}
            >
              <SelectTrigger className='h-8 w-[70px] cursor-pointer text-xs'>
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent className='border border-border bg-popover' side='top'>
                {(viewMode === "CARD" ? [24, 48, 96] : [10, 20, 30, 50]).map((size) => (
                  <SelectItem className='cursor-pointer text-xs' key={size} value={`${size}`}>
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
              className='hidden size-8 cursor-pointer lg:flex'
              disabled={page === 1 || loading}
              onClick={() => setPage(null)}
              size='icon'
              variant='outline'
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              className='size-8 cursor-pointer'
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1 > 1 ? page - 1 : null)}
              size='icon'
              variant='outline'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              className='size-8 cursor-pointer'
              disabled={page === pageCount || loading}
              onClick={() => setPage(page + 1)}
              size='icon'
              variant='outline'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              className='hidden size-8 cursor-pointer lg:flex'
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

      <AdminViewDialog
        data={viewFields}
        onDelete={() => {
          if (viewPost) {
            setViewPost(null);
            handleDelete(viewPost.id, viewPost.type);
          }
        }}
        onEdit={() => {
          if (viewPost) {
            setViewPost(null);
            handleEdit(viewPost);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setViewPost(null);
          }
        }}
        open={!!viewPost}
        title='Thông tin chi tiết'
      />
    </>
  );
}
