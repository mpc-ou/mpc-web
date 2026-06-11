"use client";

import { Loader2, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { adminCreateFaqItem, adminTranslateText, adminUpdateFaqItem } from "@/app/_actions/admin";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type FaqRow } from "./columns";

type FaqDialogModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  faq: FaqRow | null;
  target: string;
  onSuccess: () => void;
};

export function FaqDialogModal({ isOpen, onOpenChange, faq, target, onSuccess }: FaqDialogModalProps) {
  const { toast } = useToast();
  const isEdit = !!faq;

  const [loading, setLoading] = useState(false);
  const [translatingAll, setTranslatingAll] = useState(false);
  const [translatingQuestion, setTranslatingQuestion] = useState(false);
  const [translatingAnswer, setTranslatingAnswer] = useState(false);
  const [engine, setEngine] = useState<"deepseek" | "bing">("bing");

  // Form states
  const [questionVi, setQuestionVi] = useState("");
  const [answerVi, setAnswerVi] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [answerEn, setAnswerEn] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Reset/Initialize states when modal opens or faq changes
  useEffect(() => {
    if (isOpen) {
      if (faq) {
        setQuestionVi(faq.questionVi || "");
        setAnswerVi(faq.answerVi || "");
        setQuestionEn(faq.questionEn || "");
        setAnswerEn(faq.answerEn || "");
        setOrder(faq.order ?? 0);
        setIsActive(faq.isActive ?? true);
      } else {
        setQuestionVi("");
        setAnswerVi("");
        setQuestionEn("");
        setAnswerEn("");
        setOrder(0);
        setIsActive(true);
      }
    }
  }, [isOpen, faq]);

  const handleTranslateQuestion = async () => {
    if (!questionVi.trim()) {
      toast({
        variant: "destructive",
        description: "Vui lòng nhập câu hỏi Tiếng Việt trước."
      });
      return;
    }
    setTranslatingQuestion(true);
    const res = await adminTranslateText(questionVi, "vi", "en", engine);
    if (res.error) {
      toast({
        variant: "destructive",
        description: res.error.message || "Lỗi dịch thuật"
      });
    } else {
      const payload = res.data?.payload as { translation?: string } | null;
      setQuestionEn(payload?.translation || "");
      toast({ description: "Đã dịch câu hỏi sang Tiếng Anh!" });
    }
    setTranslatingQuestion(false);
  };

  const handleTranslateAnswer = async () => {
    if (!answerVi.trim()) {
      toast({
        variant: "destructive",
        description: "Vui lòng nhập câu trả lời Tiếng Việt trước."
      });
      return;
    }
    setTranslatingAnswer(true);
    const res = await adminTranslateText(answerVi, "vi", "en", engine);
    if (res.error) {
      toast({
        variant: "destructive",
        description: res.error.message || "Lỗi dịch thuật"
      });
    } else {
      const payload = res.data?.payload as { translation?: string } | null;
      setAnswerEn(payload?.translation || "");
      toast({ description: "Đã dịch câu trả lời sang Tiếng Anh!" });
    }
    setTranslatingAnswer(false);
  };

  const handleTranslateAll = async () => {
    if (!(questionVi.trim() || answerVi.trim())) {
      toast({
        variant: "destructive",
        description: "Vui lòng điền nội dung Tiếng Việt trước khi dịch."
      });
      return;
    }
    setTranslatingAll(true);
    try {
      const promises = [];
      if (questionVi.trim()) {
        promises.push(
          adminTranslateText(questionVi, "vi", "en", engine).then((res) => {
            const payload = res.data?.payload as { translation?: string } | null;
            if (payload?.translation) {
              setQuestionEn(payload.translation);
            }
          })
        );
      }
      if (answerVi.trim()) {
        promises.push(
          adminTranslateText(answerVi, "vi", "en", engine).then((res) => {
            const payload = res.data?.payload as { translation?: string } | null;
            if (payload?.translation) {
              setAnswerEn(payload.translation);
            }
          })
        );
      }
      await Promise.all(promises);
      toast({ description: "Đã dịch toàn bộ sang Tiếng Anh!" });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Đã xảy ra lỗi dịch thuật tự động."
      });
    } finally {
      setTranslatingAll(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(questionVi.trim() && answerVi.trim())) {
      toast({
        variant: "destructive",
        description: "Câu hỏi và trả lời Tiếng Việt là bắt buộc."
      });
      return;
    }

    setLoading(true);
    const payload = {
      questionVi,
      answerVi,
      questionEn,
      answerEn,
      target,
      order: Number(order) || 0,
      isActive
    };

    const res = isEdit && faq ? await adminUpdateFaqItem(faq.id, payload) : await adminCreateFaqItem(payload);

    if (res.error) {
      toast({ variant: "destructive", description: res.error.message });
      setLoading(false);
      return;
    }

    toast({
      description: isEdit ? "Cập nhật FAQ thành công!" : "Tạo FAQ mới thành công!"
    });
    setLoading(false);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa câu hỏi FAQ" : "Thêm câu hỏi FAQ mới"}</DialogTitle>
          <DialogDescription>
            Điền nội dung câu hỏi và trả lời bằng Tiếng Việt và Tiếng Anh. Sử dụng các công cụ dịch tự động nếu cần.
          </DialogDescription>
        </DialogHeader>

        <form className='space-y-6 pt-4' onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Tiếng Việt */}
            <div className='space-y-4 rounded-xl border border-border bg-card p-4'>
              <div className='mb-2 flex items-center gap-2 border-border border-b pb-2'>
                <span className='text-base'>🇻🇳</span>
                <h4 className='font-bold text-foreground text-xs uppercase tracking-wider'>Nội dung Tiếng Việt</h4>
              </div>

              <div className='space-y-2'>
                <Label className='font-semibold text-xs' htmlFor='modalQuestionVi'>
                  Câu hỏi (VI) *
                </Label>
                <Input
                  className='text-xs'
                  id='modalQuestionVi'
                  onChange={(e) => setQuestionVi(e.target.value)}
                  placeholder='Nhập câu hỏi...'
                  required
                  value={questionVi}
                />
              </div>

              <div className='space-y-2'>
                <Label className='font-semibold text-xs' htmlFor='modalAnswerVi'>
                  Câu trả lời (VI) *
                </Label>
                <Textarea
                  className='min-h-[140px] text-xs'
                  id='modalAnswerVi'
                  onChange={(e) => setAnswerVi(e.target.value)}
                  placeholder='Nhập câu trả lời...'
                  required
                  value={answerVi}
                />
              </div>
            </div>

            {/* Tiếng Anh */}
            <div className='space-y-4 rounded-xl border border-border bg-card p-4'>
              <div className='mb-2 flex flex-wrap items-center justify-between gap-2 border-border border-b pb-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-base'>🇺🇸</span>
                  <h4 className='font-bold text-foreground text-xs uppercase tracking-wider'>English Content</h4>
                </div>
                <div className='flex items-center gap-2'>
                  <Select onValueChange={(val: any) => setEngine(val)} value={engine}>
                    <SelectTrigger className='h-6 w-24 border-primary/20 px-2 py-0 text-[10px]'>
                      <SelectValue placeholder='Trình dịch' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className='text-[10px]' value='bing'>
                        Bing (API)
                      </SelectItem>
                      <SelectItem className='text-[10px]' value='deepseek'>
                        Deepseek (AI)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className='h-6 px-2 text-[10px] text-primary hover:bg-primary/5 hover:text-primary'
                    disabled={translatingAll}
                    onClick={handleTranslateAll}
                    type='button'
                    variant='ghost'
                  >
                    <Sparkles className={cn("mr-1 h-3 w-3", translatingAll && "animate-spin")} />
                    Dịch tất cả
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label className='font-semibold text-xs' htmlFor='modalQuestionEn'>
                    Question (EN)
                  </Label>
                  <Button
                    className='h-6 px-2 text-[10px] text-primary hover:bg-primary/5 hover:text-primary'
                    disabled={translatingQuestion}
                    onClick={handleTranslateQuestion}
                    type='button'
                    variant='ghost'
                  >
                    <Sparkles className={cn("mr-1 h-3 w-3", translatingQuestion && "animate-spin")} />
                    Dịch câu hỏi
                  </Button>
                </div>
                <Input
                  className='text-xs'
                  id='modalQuestionEn'
                  onChange={(e) => setQuestionEn(e.target.value)}
                  placeholder='Enter question...'
                  value={questionEn}
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label className='font-semibold text-xs' htmlFor='modalAnswerEn'>
                    Answer (EN)
                  </Label>
                  <Button
                    className='h-6 px-2 text-[10px] text-primary hover:bg-primary/5 hover:text-primary'
                    disabled={translatingAnswer}
                    onClick={handleTranslateAnswer}
                    type='button'
                    variant='ghost'
                  >
                    <Sparkles className={cn("mr-1 h-3 w-3", translatingAnswer && "animate-spin")} />
                    Dịch câu trả lời
                  </Button>
                </div>
                <Textarea
                  className='min-h-[140px] text-xs'
                  id='modalAnswerEn'
                  onChange={(e) => setAnswerEn(e.target.value)}
                  placeholder='Enter answer...'
                  value={answerEn}
                />
              </div>
            </div>
          </div>

          {/* Configs */}
          <div className='flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-4'>
            <div className='flex items-center gap-2'>
              <Label className='font-semibold text-xs' htmlFor='modalOrder'>
                Thứ tự:
              </Label>
              <Input
                className='h-8 w-20 text-xs'
                id='modalOrder'
                onChange={(e) => setOrder(Number(e.target.value) || 0)}
                type='number'
                value={order}
              />
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                checked={isActive}
                id='modalIsActive'
                onCheckedChange={(checked) => setIsActive(checked === true)}
              />
              <Label className='cursor-pointer font-semibold text-xs' htmlFor='modalIsActive'>
                Hiển thị trên Website
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} type='button' variant='outline'>
              Hủy
            </Button>
            <Button disabled={loading} type='submit'>
              {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
              {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Lưu câu hỏi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
