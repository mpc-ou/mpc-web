"use client";

import { Braces, CheckCircle2, FileCode2, RotateCcw, Wand2, XCircle } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WebDesignConfig, WebDesignExhibitionItem, WebDesignFaq } from "@/types/webdesign";
import {
  parseJsonText,
  type ValidationResult,
  validateWebDesignConfig,
  validateWebDesignExhibitions,
  validateWebDesignFaqs
} from "@/utils/webdesign-validate";
import { EditDialog } from "./edit-dialog";
import { defaultBenefits, defaultPrizes, sampleMilestones, sampleRegulations } from "./webdesign-defaults";

type DocKey = "config" | "exhibitions" | "faqs";
type Status = { kind: "idle" } | { kind: "valid" } | { kind: "invalid"; errors: string[] };

export type JsonApplyPayload = {
  config?: WebDesignConfig;
  exhibitions?: WebDesignExhibitionItem[];
  faqs?: WebDesignFaq[];
};

const toJson = (value: unknown) => JSON.stringify(value, null, 2);

/** Drops `id` fields from a template: they are optional in pasted JSON and get generated on validation. */
const withoutIds = <T extends { id: string }>(list: T[]) => list.map(({ id: _id, ...rest }) => rest);

const TEMPLATES: Record<DocKey, () => unknown> = {
  config: () => ({
    contestDate: "2026-12-05T08:00",
    registerUrl: "https://forms.gle/your-form",
    sponsorUrl: "",
    proposalUrl: "",
    rulesPdfUrl: "",
    milestones: withoutIds(sampleMilestones()),
    regulations: withoutIds(sampleRegulations()),
    prizes: withoutIds(defaultPrizes()),
    benefits: withoutIds(defaultBenefits())
  }),
  exhibitions: () => [
    {
      teamName: "Team Alpha",
      teamMembers: ["Nguyễn Văn A", "Trần Thị B"],
      subjects: "Kỷ niệm trường",
      projectName: { vi: "Website 35 năm OU", en: "OU 35th Anniversary Website" },
      description: { vi: "Mô tả ngắn…", en: "Short description…" },
      github: "https://github.com/org/repo",
      live: "https://team-alpha.vercel.app",
      thumbnail: "",
      techStack: ["React", "Tailwind CSS"]
    }
  ],
  faqs: () => [
    {
      question: { vi: "Tham gia cuộc thi có mất lệ phí không?", en: "Is there an entry fee?" },
      answer: { vi: "Cuộc thi hoàn toàn miễn phí.", en: "The contest is completely free." },
      isActive: true
    }
  ]
};

const DOCS: Record<DocKey, { label: string; hint: string; validate: (v: unknown) => ValidationResult<unknown> }> = {
  config: {
    label: "config.json",
    hint: "Ngày thi, liên kết, mốc thời gian, quy định, giải thưởng, quyền lợi. `id` có thể bỏ - tự sinh.",
    validate: validateWebDesignConfig
  },
  exhibitions: {
    label: "exhibitions.json",
    hint: "Mảng dự án triển lãm. Chuỗi thuần cho trường song ngữ = cùng nội dung vi/en.",
    validate: validateWebDesignExhibitions
  },
  faqs: {
    label: "faqs.json",
    hint: "Mảng câu hỏi theo thứ tự hiển thị. Bắt buộc bản vi; isActive: false để ẩn.",
    validate: validateWebDesignFaqs
  }
};

/**
 * Raw JSON view of the current draft. "Áp dụng" validates both documents and pushes them into the
 * draft; the page's single Save button (or "Áp dụng & Lưu") persists them.
 */
export function JsonDevDialog({
  config,
  exhibitions,
  faqs,
  onApply,
  onClose
}: {
  config: WebDesignConfig;
  exhibitions: WebDesignExhibitionItem[];
  faqs: WebDesignFaq[];
  onApply: (payload: JsonApplyPayload, options: { save: boolean }) => void;
  onClose: () => void;
}) {
  const initial: Record<DocKey, string> = {
    config: toJson(config),
    exhibitions: toJson(exhibitions),
    faqs: toJson(faqs)
  };
  const [doc, setDoc] = useState<DocKey>("config");
  const [texts, setTexts] = useState(initial);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const gutterRef = useRef<HTMLDivElement>(null);

  const text = texts[doc];
  const lineCount = text.split("\n").length;
  const isDirty = (key: DocKey) => texts[key] !== initial[key];

  const setText = (next: string) => {
    setTexts((prev) => ({ ...prev, [doc]: next }));
    setStatus({ kind: "idle" });
  };

  const validateDoc = (key: DocKey): ValidationResult<unknown> => {
    const parsed = parseJsonText(texts[key]);
    return parsed.ok ? DOCS[key].validate(parsed.data) : parsed;
  };

  const checkCurrent = () => {
    const result = validateDoc(doc);
    setStatus(result.ok ? { kind: "valid" } : { kind: "invalid", errors: result.errors });
  };

  const apply = (save: boolean) => {
    const payload: JsonApplyPayload = {};
    for (const key of Object.keys(DOCS) as DocKey[]) {
      if (!isDirty(key)) {
        continue;
      }
      const result = validateDoc(key);
      if (!result.ok) {
        setDoc(key);
        setStatus({ kind: "invalid", errors: result.errors });
        return;
      }
      Object.assign(payload, { [key]: result.data });
    }
    onApply(payload, { save });
  };

  const format = () => {
    const parsed = parseJsonText(text);
    if (parsed.ok) {
      setText(toJson(parsed.data));
    } else {
      setStatus({ kind: "invalid", errors: parsed.errors });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      apply(true);
      return;
    }
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart, selectionEnd } = el;
      setText(`${text.slice(0, selectionStart)}  ${text.slice(selectionEnd)}`);
      requestAnimationFrame(() => el.setSelectionRange(selectionStart + 2, selectionStart + 2));
    }
  };

  const anyDirty = (Object.keys(DOCS) as DocKey[]).some(isDirty);

  return (
    <EditDialog
      bodyClassName='space-y-3'
      description='Xem & sửa nhanh dữ liệu thô của trang WebDesign. Dán một khối JSON theo mẫu → Áp dụng. Ctrl/⌘ + S = Áp dụng & Lưu.'
      footerExtra={
        <>
          <Button disabled={!anyDirty} onClick={() => apply(false)} type='button' variant='outline'>
            Áp dụng
          </Button>
          <Button disabled={!anyDirty} onClick={() => apply(true)} type='button'>
            Áp dụng & Lưu
          </Button>
        </>
      }
      onClose={onClose}
      size='xl'
      title='Dev editor (JSON)'
    >
      <div className='overflow-hidden rounded-lg border border-border bg-[#0e1013] text-slate-200'>
        {/* Toolbar */}
        <div className='flex flex-wrap items-center gap-1 border-white/10 border-b bg-[#16181c] px-2 py-1.5'>
          {(Object.keys(DOCS) as DocKey[]).map((key) => (
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-colors",
                doc === key ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
              )}
              key={key}
              onClick={() => {
                setDoc(key);
                setStatus({ kind: "idle" });
              }}
              type='button'
            >
              <FileCode2 className='h-3.5 w-3.5' />
              {DOCS[key].label}
              {isDirty(key) && <span className='h-1.5 w-1.5 rounded-full bg-orange-400' title='Đã sửa' />}
            </button>
          ))}
          <div className='ml-auto flex flex-wrap gap-1'>
            <ToolbarButton icon={Wand2} label='Format' onClick={format} />
            <ToolbarButton icon={CheckCircle2} label='Kiểm tra' onClick={checkCurrent} />
            <ToolbarButton icon={Braces} label='Chèn mẫu' onClick={() => setText(toJson(TEMPLATES[doc]()))} />
            <ToolbarButton
              disabled={!isDirty(doc)}
              icon={RotateCcw}
              label='Hoàn tác'
              onClick={() => setText(initial[doc])}
            />
          </div>
        </div>

        {/* Editor */}
        <div className='flex h-[58vh] min-h-80'>
          <div
            aria-hidden='true'
            className='select-none overflow-hidden whitespace-pre border-white/5 border-r bg-[#0b0c0e] px-2 py-3 text-right font-mono text-[12.5px] text-slate-600 leading-5'
            ref={gutterRef}
          >
            {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
          </div>
          <textarea
            aria-label={DOCS[doc].label}
            className='flex-1 resize-none bg-transparent px-3 py-3 font-mono text-[12.5px] leading-5 outline-none'
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={(e) => {
              if (gutterRef.current) {
                gutterRef.current.scrollTop = e.currentTarget.scrollTop;
              }
            }}
            spellCheck={false}
            value={text}
            wrap='off'
          />
        </div>

        {/* Status bar */}
        <div className='flex flex-wrap items-center gap-3 border-white/10 border-t bg-[#16181c] px-3 py-1.5 font-mono text-[11px] text-slate-400'>
          <span>{lineCount} dòng</span>
          <span className='hidden truncate sm:inline'>{DOCS[doc].hint}</span>
          {status.kind === "valid" && (
            <span className='ml-auto flex items-center gap-1 text-emerald-400'>
              <CheckCircle2 className='h-3.5 w-3.5' /> Hợp lệ
            </span>
          )}
        </div>
      </div>

      {status.kind === "invalid" && (
        <div className='rounded-lg border border-destructive/40 bg-destructive/5 p-3'>
          <p className='mb-2 flex items-center gap-1.5 font-semibold text-destructive text-sm'>
            <XCircle className='h-4 w-4' /> {DOCS[doc].label}: {status.errors.length} lỗi
          </p>
          <ul className='max-h-40 space-y-1 overflow-y-auto font-mono text-xs'>
            {status.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </EditDialog>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled
}: {
  icon: typeof Wand2;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className='flex items-center gap-1 rounded-md px-2 py-1 text-slate-300 text-xs transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40'
      disabled={disabled}
      onClick={onClick}
      type='button'
    >
      <Icon className='h-3.5 w-3.5' />
      {label}
    </button>
  );
}
