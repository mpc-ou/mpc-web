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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      questionVi: fd.get("questionVi") as string,
      answerVi: fd.get("answerVi") as string,
      questionEn: fd.get("questionEn") as string,
      answerEn: fd.get("answerEn") as string,
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
      <DialogContent className="sm:max-w-160">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa FAQ" : "Thêm FAQ mới"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật câu hỏi song ngữ (Tiếng Việt & Tiếng Anh)."
              : "Thêm câu hỏi thường gặp mới (song ngữ)."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4" id="faq-form" onSubmit={handleSubmit}>
          <Tabs defaultValue="vi">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vi">🇻🇳 Tiếng Việt</TabsTrigger>
              <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
            </TabsList>
            <TabsContent className="grid gap-3 pt-2" value="vi">
              <div className="grid gap-2">
                <Label htmlFor="questionVi">Câu hỏi (VI) *</Label>
                <Input
                  defaultValue={faq?.questionVi}
                  id="questionVi"
                  name="questionVi"
                  placeholder="Câu hỏi thường gặp..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answerVi">Câu trả lời (VI) *</Label>
                <textarea
                  className="min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={faq?.answerVi}
                  id="answerVi"
                  name="answerVi"
                  placeholder="Câu trả lời chi tiết..."
                  required
                />
              </div>
            </TabsContent>
            <TabsContent className="grid gap-3 pt-2" value="en">
              <div className="grid gap-2">
                <Label htmlFor="questionEn">Question (EN)</Label>
                <Input
                  defaultValue={faq?.questionEn}
                  id="questionEn"
                  name="questionEn"
                  placeholder="Frequently asked question..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answerEn">Answer (EN)</Label>
                <textarea
                  className="min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={faq?.answerEn}
                  id="answerEn"
                  name="answerEn"
                  placeholder="Detailed answer..."
                />
              </div>
            </TabsContent>
          </Tabs>
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
