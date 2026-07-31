"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { adminCreateAnnouncement, adminUpdateAnnouncement } from "@/app/_actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FlagEnIcon, FlagViIcon } from "@/components/ui/flag-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { AnnouncementRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: AnnouncementRow | null;
};

async function translateAnnouncementBatch(items: { key: string; text: string }[], source: string, target: string) {
  const results = await Promise.all(
    items.map(async ({ key, text }) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, from: source, to: target })
        });
        if (!res.ok) {
          return { key, text };
        }
        const data = (await res.json()) as { translated: string };
        return { key, text: data.translated };
      } catch {
        return { key, text };
      }
    })
  );

  const out: Record<string, string> = {};
  for (const r of results) {
    out[r.key] = r.text;
  }
  return out;
}

function applyAnnouncementTranslation(
  out: Record<string, string>,
  target: "vi" | "en",
  setContentEn: (val: string) => void,
  setLinkLabelEn: (val: string) => void,
  setContentVi: (val: string) => void,
  setLinkLabelVi: (val: string) => void
) {
  if (target === "en") {
    if (out.content !== undefined) {
      setContentEn(out.content);
    }
    if (out.label !== undefined) {
      setLinkLabelEn(out.label);
    }
  } else {
    if (out.content !== undefined) {
      setContentVi(out.content);
    }
    if (out.label !== undefined) {
      setLinkLabelVi(out.label);
    }
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: AnnouncementFormDialog dialog state
export function AnnouncementFormDialog({ open, onOpenChange, announcement }: Props) {
  const isEdit = !!announcement;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(announcement?.isActive ?? true);
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");
  const [translating, setTranslating] = useState(false);

  const [contentVi, setContentVi] = useState(announcement?.contentVi ?? "");
  const [contentEn, setContentEn] = useState(announcement?.contentEn ?? "");
  const [linkLabelVi, setLinkLabelVi] = useState(announcement?.linkLabelVi ?? "");
  const [linkLabelEn, setLinkLabelEn] = useState(announcement?.linkLabelEn ?? "");

  const handleTranslate = async () => {
    const source = activeTab;
    const target = source === "vi" ? "en" : "vi";
    const content = source === "vi" ? contentVi : contentEn;
    const label = source === "vi" ? linkLabelVi : linkLabelEn;
    const toTranslate: { key: string; text: string }[] = [];
    if (content) {
      toTranslate.push({ key: "content", text: content });
    }
    if (label) {
      toTranslate.push({ key: "label", text: label });
    }

    if (toTranslate.length === 0) {
      toast({ description: "Không có nội dung để dịch." });
      return;
    }

    setTranslating(true);
    try {
      const out = await translateAnnouncementBatch(toTranslate, source, target);
      applyAnnouncementTranslation(out, target, setContentEn, setLinkLabelEn, setContentVi, setLinkLabelVi);
      setActiveTab(target);
      toast({ description: `Đã dịch tự động từ ${source.toUpperCase()} sang ${target.toUpperCase()}` });
    } catch {
      toast({ variant: "destructive", description: "Lỗi kết nối dịch thuật." });
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contentVi) {
      toast({ variant: "destructive", description: "Nội dung tiếng Việt là bắt buộc." });
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      contentVi,
      contentEn: contentEn || contentVi,
      linkUrl: (fd.get("linkUrl") as string) || undefined,
      linkLabelVi: linkLabelVi || undefined,
      linkLabelEn: linkLabelEn || undefined,
      bgColor: (fd.get("bgColor") as string) || undefined,
      isActive,
      endAt: (fd.get("endAt") as string) || undefined
    };

    const res =
      isEdit && announcement
        ? await adminUpdateAnnouncement(announcement.id, payload)
        : await adminCreateAnnouncement(payload);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
  };

  const contentField = activeTab === "vi" ? contentVi : contentEn;
  const setContentField = activeTab === "vi" ? setContentVi : setContentEn;
  const labelField = activeTab === "vi" ? linkLabelVi : linkLabelEn;
  const setLabelField = activeTab === "vi" ? setLinkLabelVi : setLinkLabelEn;

  let submitLabel = "Thêm";
  if (loading) {
    submitLabel = "Đang lưu...";
  } else if (isEdit) {
    submitLabel = "Lưu thay đổi";
  }

  return (
    <Dialog key={announcement?.id ?? "new"} onOpenChange={onOpenChange} open={open}>
      <DialogContent className='sm:max-w-[650px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa thông báo" : "Thêm thông báo"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật nội dung thông báo song ngữ." : "Thêm thông báo mới cho Announcement Bar."}
          </DialogDescription>
        </DialogHeader>
        <form className='grid gap-4 py-4' id='announcement-form' onSubmit={handleSubmit}>
          {/* Language tabs + Translate */}
          <div className='flex items-center justify-between'>
            <Tabs onValueChange={(v) => setActiveTab(v as "vi" | "en")} value={activeTab}>
              <TabsList>
                <TabsTrigger className='gap-1.5' value='vi'>
                  <FlagViIcon className='h-3.5 w-4 rounded-xs' /> Tiếng Việt
                </TabsTrigger>
                <TabsTrigger className='gap-1.5' value='en'>
                  <FlagEnIcon className='h-3.5 w-4 rounded-xs' /> English
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button disabled={translating} onClick={handleTranslate} size='sm' type='button' variant='outline'>
              <Globe className='mr-1.5 h-3.5 w-3.5' />
              {translating ? "Đang dịch..." : `Dịch → ${activeTab === "vi" ? "EN" : "VI"}`}
            </Button>
          </div>

          {/* Content */}
          <div className='grid gap-2'>
            <Label>{activeTab === "vi" ? "Nội dung tiếng Việt" : "English content"} *</Label>
            <textarea
              className='min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              onChange={(e) => setContentField(e.target.value)}
              placeholder={activeTab === "vi" ? "Nội dung thông báo..." : "Announcement content..."}
              required={activeTab === "vi"}
              value={contentField}
            />
          </div>

          {/* Link URL + Label */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='linkUrl'>URL nút CTA</Label>
              <Input defaultValue={announcement?.linkUrl ?? ""} id='linkUrl' name='linkUrl' placeholder='/auth' />
            </div>
            <div className='grid gap-2'>
              <Label>Text nút CTA ({activeTab === "vi" ? "VI" : "EN"})</Label>
              <Input
                onChange={(e) => setLabelField(e.target.value)}
                placeholder={activeTab === "vi" ? "Đăng ký ngay" : "Register now"}
                value={labelField}
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='bgColor'>Màu nền (CSS gradient)</Label>
              <Input
                defaultValue={announcement?.bgColor ?? ""}
                id='bgColor'
                name='bgColor'
                placeholder='linear-gradient(...)'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='endAt'>Ngày hết hạn</Label>
              <Input
                defaultValue={announcement?.endAt ? announcement.endAt.split("T")[0] : ""}
                id='endAt'
                name='endAt'
                type='date'
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox checked={isActive} id='isActive' onCheckedChange={(v) => setIsActive(!!v)} />
            <Label className='cursor-pointer' htmlFor='isActive'>
              Kích hoạt ngay
            </Label>
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form='announcement-form' type='submit'>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
