"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminCreateFaqItem, adminUpdateFaqItem } from "../actions";
import type { FaqRow } from "./columns";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: FaqRow | null;
};

export function FaqFormDialog({ open, onOpenChange, faq }: Props) {
  const isEdit = !!faq;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState(faq?.locale ?? "vi");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      question: fd.get("question") as string,
      answer: fd.get("answer") as string,
      locale,
      order: Number(fd.get("order")) || 0,
    };
    const res =
      isEdit && faq
        ? await adminUpdateFaqItem(faq.id, payload)
        : await adminCreateFaqItem(payload);
    if (res.error) {
      toast({ variant: "destructive", description: res.error?.message });
      setLoading(false);
      return;
    }
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog key={faq?.id ?? "new"} onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa FAQ" : "Thêm FAQ mới"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật câu hỏi và câu trả lời."
              : "Thêm câu hỏi thường gặp mới."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4" id="faq-form" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="question">Câu hỏi *</Label>
            <Input
              defaultValue={faq?.question}
              id="question"
              name="question"
              placeholder="Câu hỏi thường gặp..."
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="answer">Câu trả lời *</Label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={faq?.answer}
              id="answer"
              name="answer"
              placeholder="Câu trả lời chi tiết..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Ngôn ngữ</Label>
              <Select onValueChange={setLocale} value={locale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Thứ tự</Label>
              <Input
                defaultValue={faq?.order ?? 0}
                id="order"
                name="order"
                placeholder="0"
                type="number"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button disabled={loading} form="faq-form" type="submit">
            {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
