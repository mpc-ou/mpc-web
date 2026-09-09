"use client";

import { ChevronDown, Download, Image as ImageIcon, Monitor, Pencil, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminSaveWebDesignConfig,
  adminSaveWebDesignExhibitions,
  adminSeedWebDesignExhibitionsFromDefault
} from "@/app/_actions/admin";
import { useHandleError } from "@/app/admin/_hooks/use-handle-error";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { uploadToStorage } from "@/services/supabase-upload";
import type {
  LocalizedText,
  WebDesignBenefit,
  WebDesignConfig,
  WebDesignExhibitionItem,
  WebDesignPrize
} from "@/types/webdesign";

type Props = {
  webDesignConfig: WebDesignConfig;
  webDesignExhibitions: WebDesignExhibitionItem[];
};

const genId = () => Math.random().toString(36).slice(2, 10);

const EMPTY_TEXT: LocalizedText = { vi: "", en: "" };
const EMPTY_PRIZE: Omit<WebDesignPrize, "id"> = {
  tier: "gold",
  title: { ...EMPTY_TEXT },
  description: { ...EMPTY_TEXT }
};
const EMPTY_BENEFIT: Omit<WebDesignBenefit, "id"> = { title: { ...EMPTY_TEXT }, description: { ...EMPTY_TEXT } };

const DEFAULT_PRIZES: WebDesignPrize[] = [
  {
    id: genId(),
    tier: "gold",
    title: { vi: "Giải nhất", en: "1st Prize" },
    description: {
      vi: "Trị giá hơn 1.000.000 VNĐ, quà đặc biệt của nhà tài trợ và cúp chứng nhận",
      en: "Worth over 1,000,000 VND, a special sponsor gift and a trophy"
    }
  },
  {
    id: genId(),
    tier: "silver",
    title: { vi: "Giải nhì", en: "2nd Prize" },
    description: {
      vi: "Trị giá hơn 700.000 VNĐ, quà đặc biệt của nhà tài trợ và cúp chứng nhận",
      en: "Worth over 700,000 VND, a special sponsor gift and a trophy"
    }
  },
  {
    id: genId(),
    tier: "bronze",
    title: { vi: "Giải ba", en: "3rd Prize" },
    description: {
      vi: "Trị giá hơn 500.000 VNĐ, quà đặc biệt của nhà tài trợ và cúp chứng nhận",
      en: "Worth over 500,000 VND, a special sponsor gift and a trophy"
    }
  }
];

const DEFAULT_BENEFITS: WebDesignBenefit[] = [
  {
    id: genId(),
    title: { vi: "Giấy chứng nhận & DRL", en: "Certificate & Training Points" },
    description: {
      vi: "Tất cả thí sinh hoàn thành bài thi đều nhận được Giấy chứng nhận tham gia. Nhận +5 điểm rèn luyện (theo Điều 1).",
      en: "All contestants who complete the contest receive a Certificate of Participation and +5 training points."
    }
  },
  {
    id: genId(),
    title: { vi: "Dành cho Cổ động viên", en: "For Supporters" },
    description: {
      vi: "Tham gia cổ vũ Đêm Chung kết nhận ngay +2 điểm rèn luyện (Điều 1) & vé Lucky Draw với quà công nghệ hấp dẫn.",
      en: "Join and cheer at the Final Night to receive +2 training points & a Lucky Draw ticket with tech prizes."
    }
  }
];

const EMPTY_EXHIBITION: WebDesignExhibitionItem = {
  teamName: "",
  teamMembers: [],
  subjects: "",
  projectName: { ...EMPTY_TEXT },
  description: { ...EMPTY_TEXT },
  github: "",
  live: "",
  thumbnail: "",
  techStack: []
};

function CollapsibleSection({
  title,
  description,
  icon,
  actions,
  defaultOpen = false,
  children
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className='border-border border-t pt-6 first:border-t-0 first:pt-0'>
      <div className='mb-1 flex flex-wrap items-start justify-between gap-2'>
        <button className='flex flex-1 items-start gap-2 text-left' onClick={() => setOpen((v) => !v)} type='button'>
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          />
          <div>
            <h3 className='flex items-center gap-2 font-semibold text-base text-foreground'>
              {icon}
              {title}
            </h3>
            {description && <p className='text-muted-foreground text-xs'>{description}</p>}
          </div>
        </button>
        {actions && <div>{actions}</div>}
      </div>
      {open && <div className='mt-4'>{children}</div>}
    </div>
  );
}

function LocalizedInput({
  value,
  onChange,
  placeholder,
  className
}: {
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-1 gap-2 ${className ?? ""}`}>
      <div className='flex flex-1 items-center gap-1'>
        <span className='rounded bg-muted px-1.5 py-1 font-bold font-mono text-[10px] text-muted-foreground'>VI</span>
        <Input
          onChange={(e) => onChange({ ...value, vi: e.target.value })}
          placeholder={placeholder}
          value={value.vi}
        />
      </div>
      <div className='flex flex-1 items-center gap-1'>
        <span className='rounded bg-muted px-1.5 py-1 font-bold font-mono text-[10px] text-muted-foreground'>EN</span>
        <Input
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          placeholder={placeholder}
          value={value.en}
        />
      </div>
    </div>
  );
}

function LocalizedTextarea({
  value,
  onChange,
  placeholder
}: {
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  placeholder?: string;
}) {
  return (
    <div className='grid gap-2 sm:grid-cols-2'>
      <div className='flex items-start gap-1'>
        <span className='mt-2 rounded bg-muted px-1.5 py-1 font-bold font-mono text-[10px] text-muted-foreground'>
          VI
        </span>
        <textarea
          className='min-h-15 w-full rounded-md border border-border bg-background px-3 py-2 text-sm'
          onChange={(e) => onChange({ ...value, vi: e.target.value })}
          placeholder={placeholder}
          value={value.vi}
        />
      </div>
      <div className='flex items-start gap-1'>
        <span className='mt-2 rounded bg-muted px-1.5 py-1 font-bold font-mono text-[10px] text-muted-foreground'>
          EN
        </span>
        <textarea
          className='min-h-15 w-full rounded-md border border-border bg-background px-3 py-2 text-sm'
          onChange={(e) => onChange({ ...value, en: e.target.value })}
          placeholder={placeholder}
          value={value.en}
        />
      </div>
    </div>
  );
}

function ExhibitionFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  uploading,
  onUploadThumbnail
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WebDesignExhibitionItem;
  onSubmit: (item: WebDesignExhibitionItem) => void;
  uploading: boolean;
  onUploadThumbnail: (file: File) => Promise<string | null>;
}) {
  const [draft, setDraft] = useState<WebDesignExhibitionItem>(item);

  const patch = (p: Partial<WebDesignExhibitionItem>) => setDraft((prev) => ({ ...prev, ...p }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const url = await onUploadThumbnail(file);
    if (url) {
      patch({ thumbnail: url });
    }
  };

  return (
    <Dialog
      onOpenChange={(v) => {
        if (v) {
          setDraft(item);
        }
        onOpenChange(v);
      }}
      open={open}
    >
      <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{item.teamName ? "Sửa triển lãm" : "Thêm triển lãm"}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-3 sm:grid-cols-2'>
          <Input onChange={(e) => patch({ teamName: e.target.value })} placeholder='Tên đội' value={draft.teamName} />
          <Input onChange={(e) => patch({ subjects: e.target.value })} placeholder='Chủ đề' value={draft.subjects} />
          <Input onChange={(e) => patch({ live: e.target.value })} placeholder='URL demo (live)' value={draft.live} />
          <Input onChange={(e) => patch({ github: e.target.value })} placeholder='URL GitHub' value={draft.github} />
          <Input
            className='sm:col-span-2'
            onChange={(e) =>
              patch({
                techStack: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              })
            }
            placeholder='Tech stack (phân cách bằng dấu phẩy)'
            value={draft.techStack.join(", ")}
          />
        </div>

        <div className='flex items-center gap-4 rounded-lg border border-border bg-muted/10 p-3'>
          <div className='relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted/30'>
            {draft.thumbnail ? (
              <Image alt='Thumbnail' className='object-cover' fill sizes='96px' src={draft.thumbnail} />
            ) : (
              <span className='text-[10px] text-muted-foreground'>No image</span>
            )}
          </div>
          <div className='flex flex-1 flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <Input
                onChange={(e) => patch({ thumbnail: e.target.value })}
                placeholder='URL ảnh thumbnail'
                value={draft.thumbnail}
              />
              <Button
                className='h-9 shrink-0 text-xs'
                disabled={uploading}
                onClick={() => document.getElementById("wd-thumb-dialog-input")?.click()}
                size='sm'
                type='button'
                variant='outline'
              >
                <Upload className='mr-1.5 h-3.5 w-3.5' />
                {uploading ? "Đang tải..." : "Tải ảnh"}
              </Button>
              <input
                accept='image/*'
                className='hidden'
                id='wd-thumb-dialog-input'
                onChange={handleFileChange}
                type='file'
              />
            </div>
            <p className='text-[10px] text-muted-foreground'>Dán URL trực tiếp hoặc tải ảnh lên (Supabase Storage).</p>
          </div>
        </div>

        <div className='grid gap-2'>
          <Label className='text-xs'>Tên dự án</Label>
          <LocalizedInput
            onChange={(next) => patch({ projectName: next })}
            placeholder='Tên dự án'
            value={draft.projectName}
          />
        </div>
        <div className='grid gap-2'>
          <Label className='text-xs'>Mô tả</Label>
          <LocalizedTextarea
            onChange={(next) => patch({ description: next })}
            placeholder='Mô tả dự án'
            value={draft.description}
          />
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type='button' variant='outline'>
            Hủy
          </Button>
          <Button
            onClick={() => {
              onSubmit(draft);
              onOpenChange(false);
            }}
            type='button'
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const SiteConfigManager = ({ webDesignConfig, webDesignExhibitions }: Props) => {
  const router = useRouter();
  const { handleErrorClient, toast } = useHandleError();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [contestDate, setContestDate] = useState(webDesignConfig.contestDate);
  const [registerUrl, setRegisterUrl] = useState(webDesignConfig.registerUrl);
  const [sponsorUrl, setSponsorUrl] = useState(webDesignConfig.sponsorUrl);
  const [proposalUrl, setProposalUrl] = useState(webDesignConfig.proposalUrl);
  const [prizes, setPrizes] = useState<WebDesignPrize[]>(webDesignConfig.prizes);
  const [benefits, setBenefits] = useState<WebDesignBenefit[]>(webDesignConfig.benefits);

  const [exhibitions, setExhibitions] = useState<WebDesignExhibitionItem[]>(webDesignExhibitions);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSaveConfig = async () => {
    setLoading(true);
    await handleErrorClient({
      cb: () =>
        adminSaveWebDesignConfig({
          contestDate,
          registerUrl,
          sponsorUrl,
          proposalUrl,
          prizes,
          benefits
        }),
      onSuccess: () => router.refresh()
    });
    setLoading(false);
  };

  const handleSaveExhibitions = async (next: WebDesignExhibitionItem[]) => {
    setLoading(true);
    await handleErrorClient({
      cb: () => adminSaveWebDesignExhibitions(next),
      onSuccess: () => router.refresh()
    });
    setLoading(false);
  };

  const handleLoadDefaultExhibitions = async () => {
    const ok = await confirm({
      title: "Nạp danh sách triển lãm mặc định?",
      description: "Thao tác này sẽ ghi đè danh sách triển lãm hiện tại bằng dữ liệu từ configs/data/wd.json.",
      variant: "default",
      confirmText: "Nạp mặc định"
    });
    if (!ok) {
      return;
    }
    setLoading(true);
    await handleErrorClient({
      cb: () => adminSeedWebDesignExhibitionsFromDefault(),
      onSuccess: () => {
        toast({ description: "Đã nạp danh sách triển lãm mặc định" });
        router.refresh();
      }
    });
    setLoading(false);
  };

  const handleResetToDefaults = async () => {
    const ok = await confirm({
      title: "Đặt lại toàn bộ dữ liệu mặc định?",
      description:
        "Giải thưởng, quyền lợi sẽ được điền lại theo mẫu mặc định, và danh sách triển lãm sẽ được nạp lại từ configs/data/wd.json. Nhấn Lưu để áp dụng.",
      variant: "default",
      confirmText: "Đặt lại mặc định"
    });
    if (!ok) {
      return;
    }
    setLoading(true);
    setPrizes(DEFAULT_PRIZES);
    setBenefits(DEFAULT_BENEFITS);
    await handleErrorClient({
      cb: () => adminSeedWebDesignExhibitionsFromDefault(),
      onSuccess: () => {
        toast({ description: "Đã đặt lại dữ liệu mặc định. Nhấn Lưu để hoàn tất." });
        router.refresh();
      }
    });
    setLoading(false);
  };

  const updatePrize = (id: string, patch: Partial<WebDesignPrize>) =>
    setPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const updateBenefit = (id: string, patch: Partial<WebDesignBenefit>) =>
    setBenefits((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const handleUploadThumbnail = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const url = await uploadToStorage(file, "media", "webdesign");
      toast({ description: "Đã tải ảnh lên thành công!" });
      return url;
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Lỗi tải ảnh: ${err instanceof Error ? err.message : "Thất bại"}`
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const openEditDialog = (idx: number) => {
    setEditingIndex(idx);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (item: WebDesignExhibitionItem) => {
    const next =
      editingIndex === null ? [...exhibitions, item] : exhibitions.map((ex, i) => (i === editingIndex ? item : ex));
    setExhibitions(next);
    handleSaveExhibitions(next);
  };

  const handleDeleteExhibition = async (idx: number) => {
    const ok = await confirm({
      title: "Xóa triển lãm này?",
      description: "Hành động này không thể hoàn tác."
    });
    if (!ok) {
      return;
    }
    const next = exhibitions.filter((_, i) => i !== idx);
    setExhibitions(next);
    await handleSaveExhibitions(next);
  };

  return (
    <div className='flex flex-col gap-8'>
      <ConfirmDialog />

      {dialogOpen && (
        <ExhibitionFormDialog
          item={editingIndex === null ? EMPTY_EXHIBITION : (exhibitions[editingIndex] ?? EMPTY_EXHIBITION)}
          onOpenChange={setDialogOpen}
          onSubmit={handleDialogSubmit}
          onUploadThumbnail={handleUploadThumbnail}
          open={dialogOpen}
          uploading={uploading}
        />
      )}

      {/* ─── WebDesign Contest (+ Exhibitions) ─── */}
      <section className='rounded-xl border border-border bg-background p-6 shadow-sm'>
        <div className='mb-4 flex flex-wrap items-start justify-between gap-2'>
          <div>
            <h2 className='flex items-center gap-2 font-semibold text-foreground text-lg'>
              <Monitor className='h-5 w-5 text-primary' /> WebDesign Contest
            </h2>
            <p className='text-muted-foreground text-xs'>
              Cấu hình trang <code>/activities/webdesign</code>. Để trống một nút để tự động ẩn nút đó ngoài trang. Các
              trường nội dung hỗ trợ song ngữ VI/EN.
            </p>
          </div>
          <Button disabled={loading} onClick={handleResetToDefaults} size='sm' type='button' variant='outline'>
            <Download className='mr-1.5 h-3.5 w-3.5' /> Đặt lại mặc định
          </Button>
        </div>

        <CollapsibleSection title='Thông tin chung & liên kết'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='wd-contest-date'>Ngày thi cuộc thi</Label>
              <Input
                id='wd-contest-date'
                onChange={(e) => setContestDate(e.target.value)}
                type='datetime-local'
                value={contestDate}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='wd-register-url'>Nút "Đăng ký ngay" (URL)</Label>
              <Input
                id='wd-register-url'
                onChange={(e) => setRegisterUrl(e.target.value)}
                placeholder='https://... (để trống để ẩn nút)'
                value={registerUrl}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='wd-sponsor-url'>Nút "Hợp tác tài trợ ngay" (URL)</Label>
              <Input
                id='wd-sponsor-url'
                onChange={(e) => setSponsorUrl(e.target.value)}
                placeholder='https://... (để trống để ẩn nút)'
                value={sponsorUrl}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='wd-proposal-url'>Nút "Proposal" (URL)</Label>
              <Input
                id='wd-proposal-url'
                onChange={(e) => setProposalUrl(e.target.value)}
                placeholder='https://... (để trống để tự động quét link mới nhất)'
                value={proposalUrl}
              />
            </div>
          </div>
          <Button className='mt-4 h-9 w-fit text-xs' disabled={loading} onClick={handleSaveConfig} type='button'>
            {loading ? "Đang lưu..." : "Lưu cấu hình WebDesign"}
          </Button>
        </CollapsibleSection>

        <CollapsibleSection
          actions={
            <Button
              onClick={() => setPrizes((prev) => [...prev, { ...EMPTY_PRIZE, id: genId() }])}
              size='sm'
              type='button'
              variant='outline'
            >
              <Plus className='mr-1 h-3.5 w-3.5' /> Thêm giải
            </Button>
          }
          description={`${prizes.length} giải thưởng`}
          title='Giải thưởng (Prizes)'
        >
          <div className='flex flex-col gap-3'>
            {prizes.map((prize) => (
              <div className='flex flex-col gap-2 rounded-lg border border-border bg-muted/10 p-3' key={prize.id}>
                <div className='flex items-center gap-2'>
                  <select
                    className='h-9 rounded-md border border-border bg-background px-2 text-sm'
                    onChange={(e) => updatePrize(prize.id, { tier: e.target.value as WebDesignPrize["tier"] })}
                    value={prize.tier}
                  >
                    <option value='gold'>Vàng</option>
                    <option value='silver'>Bạc</option>
                    <option value='bronze'>Đồng</option>
                  </select>
                  <LocalizedInput
                    className='min-w-40'
                    onChange={(next) => updatePrize(prize.id, { title: next })}
                    placeholder='Tên giải'
                    value={prize.title}
                  />
                  <Button
                    onClick={() => setPrizes((prev) => prev.filter((p) => p.id !== prize.id))}
                    size='icon'
                    type='button'
                    variant='ghost'
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
                <LocalizedInput
                  onChange={(next) => updatePrize(prize.id, { description: next })}
                  placeholder='Mô tả'
                  value={prize.description}
                />
              </div>
            ))}
            {prizes.length === 0 && <p className='text-muted-foreground text-xs'>Chưa có giải thưởng nào.</p>}
          </div>
          <Button className='mt-4 h-9 w-fit text-xs' disabled={loading} onClick={handleSaveConfig} type='button'>
            {loading ? "Đang lưu..." : "Lưu cấu hình WebDesign"}
          </Button>
        </CollapsibleSection>

        <CollapsibleSection
          actions={
            <Button
              onClick={() => setBenefits((prev) => [...prev, { ...EMPTY_BENEFIT, id: genId() }])}
              size='sm'
              type='button'
              variant='outline'
            >
              <Plus className='mr-1 h-3.5 w-3.5' /> Thêm quyền lợi
            </Button>
          }
          description={`${benefits.length} quyền lợi`}
          title='Quyền lợi (Benefits)'
        >
          <div className='flex flex-col gap-3'>
            {benefits.map((benefit) => (
              <div className='flex flex-col gap-2 rounded-lg border border-border bg-muted/10 p-3' key={benefit.id}>
                <div className='flex items-center gap-2'>
                  <LocalizedInput
                    onChange={(next) => updateBenefit(benefit.id, { title: next })}
                    placeholder='Tên quyền lợi'
                    value={benefit.title}
                  />
                  <Button
                    onClick={() => setBenefits((prev) => prev.filter((b) => b.id !== benefit.id))}
                    size='icon'
                    type='button'
                    variant='ghost'
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
                <LocalizedInput
                  onChange={(next) => updateBenefit(benefit.id, { description: next })}
                  placeholder='Mô tả'
                  value={benefit.description}
                />
              </div>
            ))}
            {benefits.length === 0 && <p className='text-muted-foreground text-xs'>Chưa có quyền lợi nào.</p>}
          </div>
          <Button className='mt-4 h-9 w-fit text-xs' disabled={loading} onClick={handleSaveConfig} type='button'>
            {loading ? "Đang lưu..." : "Lưu cấu hình WebDesign"}
          </Button>
        </CollapsibleSection>

        <CollapsibleSection
          actions={
            <div className='flex items-center gap-2'>
              <Button
                disabled={loading}
                onClick={handleLoadDefaultExhibitions}
                size='sm'
                type='button'
                variant='outline'
              >
                <Download className='mr-1.5 h-3.5 w-3.5' /> Nạp mặc định
              </Button>
              <Button disabled={loading} onClick={openCreateDialog} size='sm' type='button'>
                <Plus className='mr-1.5 h-3.5 w-3.5' /> Thêm
              </Button>
            </div>
          }
          description={`${exhibitions.length} dự án hiển thị ở mục "Exhibition"`}
          icon={<ImageIcon className='h-4 w-4 text-primary' />}
          title='Triển lãm WebDesign'
        >
          <div className='overflow-hidden rounded-lg border border-border'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-border border-b bg-muted/50'>
                  <th className='w-16 px-3 py-2 text-left font-medium text-muted-foreground'>Ảnh</th>
                  <th className='px-3 py-2 text-left font-medium text-muted-foreground'>Đội</th>
                  <th className='px-3 py-2 text-left font-medium text-muted-foreground'>Dự án</th>
                  <th className='px-3 py-2 text-right font-medium text-muted-foreground'>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {exhibitions.map((ex, idx) => (
                  <tr className='border-border border-b last:border-0 hover:bg-muted/30' key={`${ex.teamName}-${idx}`}>
                    <td className='px-3 py-2'>
                      <div className='relative h-10 w-14 overflow-hidden rounded border border-border bg-muted/30'>
                        {ex.thumbnail && (
                          <Image alt={ex.teamName} className='object-cover' fill sizes='56px' src={ex.thumbnail} />
                        )}
                      </div>
                    </td>
                    <td className='px-3 py-2 font-medium'>{ex.teamName || "—"}</td>
                    <td className='max-w-xs truncate px-3 py-2 text-muted-foreground text-xs'>
                      {ex.projectName.vi || ex.projectName.en || "—"}
                    </td>
                    <td className='px-3 py-2 text-right'>
                      <Button onClick={() => openEditDialog(idx)} size='sm' variant='ghost'>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button onClick={() => handleDeleteExhibition(idx)} size='sm' variant='ghost'>
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </td>
                  </tr>
                ))}
                {exhibitions.length === 0 && (
                  <tr>
                    <td className='px-4 py-8 text-center text-muted-foreground' colSpan={4}>
                      Chưa có triển lãm nào. Thêm mới hoặc nạp mặc định.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      </section>
    </div>
  );
};
