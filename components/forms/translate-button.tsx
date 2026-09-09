"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type TranslateEngine, translateFields } from "./use-bilingual-form";

type Props = {
  from: "vi" | "en";
  to: "vi" | "en";
  fields: { title?: string; summary?: string | null; content?: string };
  onTranslated: (result: { title?: string; summary?: string; content?: string }) => void;
  label?: string;
  disabled?: boolean;
};

export function TranslateButton({ from, to, fields, onTranslated, label, disabled }: Props) {
  const { toast } = useToast();
  const [translating, setTranslating] = useState(false);
  const [engine, setEngine] = useState<TranslateEngine>("deepseek");

  const fromLabel = from === "vi" ? "Tiếng Việt" : "English";
  const toLabel = to === "vi" ? "Tiếng Việt" : "English";

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const result = await translateFields(fields, from, to, engine);
      onTranslated(result);
      toast({
        variant: "success",
        description: `Đã dịch tự động từ ${fromLabel} sang ${toLabel} (${engine === "deepseek" ? "DeepSeek" : "Bing"})`
      });
    } catch {
      toast({
        variant: "destructive",
        description: "Dịch tự động thất bại. Vui lòng thử lại."
      });
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className='flex items-center gap-1.5'>
      <Select onValueChange={(v) => setEngine(v as TranslateEngine)} value={engine}>
        <SelectTrigger className='h-8 w-[100px] border-primary/20 px-2 py-0 text-[10px]'>
          <SelectValue placeholder='Trình dịch' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem className='text-[10px]' value='deepseek'>
            DeepSeek (AI)
          </SelectItem>
          <SelectItem className='text-[10px]' value='bing'>
            Bing (API)
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        className='h-8 gap-1.5 text-xs'
        disabled={disabled || translating}
        onClick={handleTranslate}
        size='sm'
        type='button'
        variant='outline'
      >
        {translating ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Sparkles className='h-3.5 w-3.5' />}
        {label ?? `Dịch tự động (${fromLabel} → ${toLabel})`}
      </Button>
    </div>
  );
}
