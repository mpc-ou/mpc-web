"use client";

import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  adminDeleteFaqItem,
  adminSeedDefaultFaqItems,
  adminTranslateText,
  adminUpdateFaqItem
} from "@/app/_actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useHandleError } from "@/hooks/use-handle-error";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type FaqRow } from "./columns";
import { FAQ_TARGETS } from "./constants";
import { FaqDialogModal } from "./faq-form";

type Props = {
  data: FaqRow[];
};

const CATEGORY_DETAILS: Record<string, { title: string; description: string; icon: string; bgGradient: string }> = {
  GENERAL: {
    title: "Chung",
    description: "Các câu hỏi phổ biến nhất về câu lạc bộ, phương thức liên hệ và thông tin tổng quan.",
    icon: "💬",
    bgGradient: "from-blue-500/10 to-indigo-500/10 border-blue-500/20"
  },
  ABOUT: {
    title: "Giới thiệu (About)",
    description: "Giới thiệu lịch sử hình thành, sứ mệnh, tầm nhìn và giá trị cốt lõi của CLB.",
    icon: "ℹ️",
    bgGradient: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
  },
  WEBDESIGN: {
    title: "Web Design",
    description: "Giải đáp thắc mắc liên quan tới quy trình thiết kế, lập trình và vận hành website CLB.",
    icon: "💻",
    bgGradient: "from-purple-500/10 to-pink-500/10 border-purple-500/20"
  },
  SPONSOR: {
    title: "Nhà tài trợ",
    description: "Quyền lợi nhà tài trợ, cơ hội hợp tác doanh nghiệp và các thông tin tài trợ.",
    icon: "🤝",
    bgGradient: "from-amber-500/10 to-orange-500/10 border-amber-500/20"
  },
  TRAINING: {
    title: "Training",
    description: "Lộ trình đào tạo, tài liệu học tập, các khóa học kỹ năng và hoạt động chuyên môn.",
    icon: "🎓",
    bgGradient: "from-rose-500/10 to-red-500/10 border-rose-500/20"
  },
  ACTIVITIES: {
    title: "Hoạt động",
    description: "Thông tin về các sự kiện, cuộc thi, hoạt động dã ngoại và sinh hoạt định kỳ.",
    icon: "🏆",
    bgGradient: "from-sky-500/10 to-cyan-500/10 border-sky-500/20"
  },
  PROJECTS: {
    title: "Dự án",
    description: "Giải đáp thắc mắc liên quan tới quy trình tham gia dự án, phát triển sản phẩm của CLB.",
    icon: "📂",
    bgGradient: "from-violet-500/10 to-indigo-500/10 border-violet-500/20"
  }
};

export function FaqDataTable({ data }: Props) {
  const router = useRouter();
  const { handleErrorClient } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { toast } = useToast();

  const [seeding, setSeeding] = useState(false);

  // Selected category view state
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  // Search
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");

  // Auto translate state for entire category
  const [translatingAllCategory, setTranslatingAllCategory] = useState(false);

  // Dialog/Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqRow | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const filteredData = useMemo(() => {
    let result = data;
    if (selectedTarget) {
      result = result.filter((item) => item.target === selectedTarget);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.questionVi.toLowerCase().includes(s) ||
          item.answerVi.toLowerCase().includes(s) ||
          item.questionEn?.toLowerCase().includes(s) ||
          item.answerEn?.toLowerCase().includes(s)
      );
    }
    // Sort by order ascending
    return [...result].sort((a, b) => a.order - b.order);
  }, [data, search, selectedTarget]);

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Xóa FAQ?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    await handleErrorClient({
      cb: () => adminDeleteFaqItem(id),
      onSuccess: () => {
        toast({ description: "Đã xóa FAQ thành công!" });
        router.refresh();
      }
    });
  };

  const handleSeedDefaults = async (target?: string) => {
    const targetName = target ? CATEGORY_DETAILS[target]?.title || target : "tất cả các nhóm";
    const ok = await confirm({
      title: "Ghi đè FAQ mặc định?",
      description: `Hệ thống sẽ xóa toàn bộ FAQ hiện có trong ${targetName} và ghi đè bằng dữ liệu mẫu từ cấu hình (configs/data/fqa.json).`
    });
    if (!ok) {
      return;
    }

    setSeeding(true);
    await handleErrorClient({
      cb: () => adminSeedDefaultFaqItems(target),
      onSuccess: (res: any) => {
        const count = res?.seededCount ?? 0;
        toast({
          description: `Đã nạp thành công ${count} FAQ mẫu vào database!`
        });
        router.refresh();
      }
    });
    setSeeding(false);
  };

  const handleTranslateAllCategory = async () => {
    const itemsToTranslate = data.filter((item) => item.target === selectedTarget);
    if (itemsToTranslate.length === 0) {
      toast({ description: "Không có câu hỏi nào để dịch." });
      return;
    }

    const ok = await confirm({
      title: "Dịch tất cả sang Tiếng Anh?",
      description: `Hệ thống sẽ dịch toàn bộ ${itemsToTranslate.length} câu hỏi và câu trả lời trong nhóm này sang Tiếng Anh. Quá trình dịch tự động này có thể mất một vài giây.`
    });
    if (!ok) {
      return;
    }

    setTranslatingAllCategory(true);
    try {
      let successCount = 0;
      for (const item of itemsToTranslate) {
        let questionEn = item.questionEn || "";
        let answerEn = item.answerEn || "";

        // Only translate if Vietnamese content is present
        const tQ = item.questionVi.trim() ? await adminTranslateText(item.questionVi, "vi", "en") : null;
        const tA = item.answerVi.trim() ? await adminTranslateText(item.answerVi, "vi", "en") : null;

        const qPayload = tQ?.data?.payload as { translation?: string } | null;
        const aPayload = tA?.data?.payload as { translation?: string } | null;

        await adminUpdateFaqItem(item.id, {
          questionEn: qPayload?.translation || questionEn,
          answerEn: aPayload?.translation || answerEn
        });
        successCount++;
      }
      toast({
        description: `Đã dịch và cập nhật thành công ${successCount}/${itemsToTranslate.length} FAQ!`
      });
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Đã xảy ra lỗi trong quá trình tự động dịch."
      });
    } finally {
      setTranslatingAllCategory(false);
    }
  };

  const activeCategoryDetails = selectedTarget ? CATEGORY_DETAILS[selectedTarget] : null;

  return (
    <div className='flex flex-col gap-6'>
      <ConfirmDialog />

      {selectedTarget === null ? (
        /* 1. Category Overview Landing Page */
        <div className='flex flex-col gap-6'>
          {/* Top action row */}
          <div className='flex items-center justify-end'>
            <Button
              className='h-9 gap-1.5 border-primary/20 text-primary text-xs hover:bg-primary/5'
              disabled={seeding}
              onClick={() => handleSeedDefaults()}
              variant='outline'
            >
              {seeding ? <Loader2 className='h-4 w-4 animate-spin' /> : <RefreshCw className='h-4 w-4' />}
              {seeding ? "Đang xử lý..." : "Ghi đè tất cả FAQs mẫu"}
            </Button>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {FAQ_TARGETS.map((t) => {
              const details = CATEGORY_DETAILS[t.value] || {
                title: t.label,
                description: "Quản lý câu hỏi thường gặp của nhóm này.",
                icon: "❓",
                bgGradient: "from-gray-500/10 to-slate-500/10 border-gray-500/20"
              };
              const count = data.filter((item) => item.target === t.value).length;

              return (
                <div
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/20 hover:shadow-md",
                    "bg-gradient-to-br",
                    details.bgGradient
                  )}
                  key={t.value}
                >
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <span className='text-3xl'>{details.icon}</span>
                      <Badge className='bg-background/80 font-semibold backdrop-blur-xs' variant='secondary'>
                        {count} câu hỏi
                      </Badge>
                    </div>
                    <h3 className='mb-2 font-bold text-foreground text-lg'>{details.title}</h3>
                    <p className='text-muted-foreground text-xs leading-relaxed'>{details.description}</p>
                  </div>
                  <div className='mt-6 flex items-center justify-end border-border/40 border-t pt-4'>
                    <Button
                      className='gap-1.5 font-semibold text-xs transition-transform group-hover:translate-x-0.5'
                      onClick={() => {
                        setSelectedTarget(t.value);
                        setSearchVal("");
                      }}
                      size='sm'
                    >
                      Xem & Quản lý
                      <ArrowRight className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. Category Detail Management Page */
        <div>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
            <Button
              className='h-9 gap-1.5 text-muted-foreground text-xs'
              onClick={() => {
                setSelectedTarget(null);
                setSearchVal("");
              }}
              variant='ghost'
            >
              <ArrowLeft className='h-4 w-4' />
              Quay lại danh sách nhóm
            </Button>

            <div className='flex items-center gap-2'>
              <Button
                className='h-9 gap-1.5 text-muted-foreground text-xs hover:bg-muted'
                disabled={seeding}
                onClick={() => handleSeedDefaults(selectedTarget)}
                variant='outline'
              >
                {seeding ? <Loader2 className='h-4 w-4 animate-spin' /> : <RefreshCw className='h-4 w-4' />}
                {seeding ? "Đang xử lý..." : "Ghi đè mẫu nhóm này"}
              </Button>

              <Button
                className='h-9 gap-1.5 border-primary/20 font-medium text-primary text-xs hover:bg-primary/5 hover:text-primary'
                disabled={translatingAllCategory}
                onClick={handleTranslateAllCategory}
                variant='outline'
              >
                {translatingAllCategory ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Sparkles className='h-4 w-4' />
                )}
                {translatingAllCategory ? "Đang dịch..." : "Dịch tất cả sang tiếng Anh"}
              </Button>

              <Button
                className='h-9 gap-1.5 font-semibold text-xs'
                onClick={() => {
                  setEditingFaq(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className='h-4 w-4' />
                Thêm FAQ mới
              </Button>
            </div>
          </div>

          {activeCategoryDetails && (
            <div className='mb-6 rounded-2xl border border-border bg-card p-6 shadow-xs'>
              <div className='flex items-center gap-4'>
                <span className='text-4xl'>{activeCategoryDetails.icon}</span>
                <div>
                  <h2 className='font-bold text-foreground text-xl'>{activeCategoryDetails.title}</h2>
                  <p className='mt-1 text-muted-foreground text-xs'>{activeCategoryDetails.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search bar inside category */}
          <div className='relative mb-6 max-w-md'>
            <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
            <Input
              className='h-9 pl-9 text-xs'
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder='Tìm kiếm trong nhóm này...'
              value={searchVal}
            />
          </div>

          {/* FAQ Cards list */}
          {filteredData.length === 0 ? (
            <div className='rounded-2xl border border-border border-dashed bg-card p-12 text-center'>
              <HelpCircle className='mx-auto mb-3 h-12 w-12 text-muted-foreground/40' />
              <h3 className='mb-1 font-bold text-foreground text-sm'>Chưa có câu hỏi nào</h3>
              <p className='mx-auto mb-4 max-w-sm text-muted-foreground text-xs'>
                Nhóm này chưa có câu hỏi nào hoặc không tìm thấy kết quả phù hợp. Hãy tạo câu hỏi đầu tiên hoặc bấm nút
                "Ghi đè mẫu nhóm này".
              </p>
              <div className='flex items-center justify-center gap-3'>
                <Button
                  className='text-xs'
                  disabled={seeding}
                  onClick={() => handleSeedDefaults(selectedTarget)}
                  size='sm'
                  variant='outline'
                >
                  <RefreshCw className='mr-1.5 h-3.5 w-3.5' /> Ghi đè mẫu nhóm này
                </Button>
                <Button
                  className='text-xs'
                  onClick={() => {
                    setEditingFaq(null);
                    setIsModalOpen(true);
                  }}
                  size='sm'
                >
                  <Plus className='mr-1.5 h-3.5 w-3.5' /> Thêm FAQ mới
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredData.map((item) => (
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-sm",
                    !item.isActive && "border-dashed bg-muted/20 opacity-65"
                  )}
                  key={item.id}
                >
                  <div className='mb-4 flex items-center justify-between gap-4 border-border/40 border-b pb-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge className='font-mono text-[10px] text-muted-foreground' variant='outline'>
                        Thứ tự: {item.order}
                      </Badge>
                      {!item.isActive && (
                        <Badge className='text-[10px]' variant='destructive'>
                          Đang ẩn
                        </Badge>
                      )}
                      {item.isActive && (
                        <Badge
                          className='border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600'
                          variant='secondary'
                        >
                          Hiển thị
                        </Badge>
                      )}
                    </div>

                    <div className='flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100'>
                      <Button
                        className='h-8 w-8 hover:bg-muted'
                        onClick={() => {
                          setEditingFaq(item);
                          setIsModalOpen(true);
                        }}
                        size='icon'
                        title='Chỉnh sửa'
                        variant='ghost'
                      >
                        <Pencil className='h-3.5 w-3.5 text-foreground' />
                      </Button>
                      <Button
                        className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                        onClick={() => handleDelete(item.id)}
                        size='icon'
                        title='Xóa'
                        variant='ghost'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Tiếng Việt */}
                    <div className='space-y-2 border-border/40 border-r pr-4 last:border-r-0'>
                      <div className='flex items-center gap-1.5 font-semibold text-foreground text-xs'>
                        <span>🇻🇳</span> Tiếng Việt
                      </div>
                      <div className='font-bold text-foreground text-sm'>{item.questionVi}</div>
                      <p className='whitespace-pre-wrap text-muted-foreground text-xs leading-relaxed'>
                        {item.answerVi}
                      </p>
                    </div>

                    {/* Tiếng Anh */}
                    <div className='space-y-2'>
                      <div className='flex items-center gap-1.5 font-semibold text-foreground text-xs'>
                        <span>🇺🇸</span> Tiếng Anh
                      </div>
                      <div className='font-bold text-foreground text-sm'>
                        {item.questionEn ? (
                          item.questionEn
                        ) : (
                          <span className='font-normal text-muted-foreground/40 text-xs italic'>
                            Chưa có câu hỏi Tiếng Anh
                          </span>
                        )}
                      </div>
                      <p className='whitespace-pre-wrap text-muted-foreground text-xs leading-relaxed'>
                        {item.answerEn ? (
                          item.answerEn
                        ) : (
                          <span className='text-muted-foreground/40 text-xs italic'>Chưa có câu trả lời Tiếng Anh</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog for Create/Edit FAQ */}
      {selectedTarget && (
        <FaqDialogModal
          faq={editingFaq}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={() => router.refresh()}
          target={selectedTarget}
        />
      )}
    </div>
  );
}
