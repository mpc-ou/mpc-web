"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  SquareCode,
  Table
} from "lucide-react";
import { useEffect, useState } from "react";
import { adminRegisterTempImage } from "@/app/_actions/admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UPLOAD_MAX_IMAGE_SIZE } from "@/constants/upload";
import { uploadToStorage } from "@/services/supabase-upload";

const FILE_EXT_REGEX = /\.[^.]+$/;
const SPECIAL_CHAR_REGEX = /[-_]/g;

export type InlineUploadTaskParams = {
  file: File;
  insertOffset: number;
  getCurrentValue: () => string;
  setFieldValue: (nextVal: string, pushHistory?: boolean) => void;
  onStart: () => void;
  onProgress: (pct: number) => void;
  onFinish: () => void;
  onError: (msg: string) => void;
};

export function validateInlineImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Chỉ chấp nhận file ảnh (jpg, png, gif, webp)";
  }
  if (file.size > UPLOAD_MAX_IMAGE_SIZE) {
    return "Ảnh quá lớn (tối đa 5MB)";
  }
  return null;
}

export async function executeInlineImageUploadTask(params: InlineUploadTaskParams) {
  const errMsg = validateInlineImageFile(params.file);
  if (errMsg) {
    params.onError(errMsg);
    return;
  }

  const initialVal = params.getCurrentValue();
  const safeOffset = Math.min(Math.max(0, params.insertOffset), initialVal.length);
  const savedScrollY = typeof window !== "undefined" ? window.scrollY : 0;

  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const placeholderToken = `\n![⏳ Đang tải ảnh lên...](uploading://${uploadId})\n`;

  params.setFieldValue(`${initialVal.slice(0, safeOffset)}${placeholderToken}${initialVal.slice(safeOffset)}`, false);
  if (typeof window !== "undefined") {
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY, behavior: "instant" as ScrollBehavior });
    });
  }

  params.onStart();
  params.onProgress(1);

  try {
    const url = await uploadToStorage(params.file, "media", "editor", (pct) => {
      params.onProgress(pct);
    });
    try {
      await adminRegisterTempImage(url);
    } catch {
      // ignore if user is non-admin
    }
    const altText = params.file.name.replace(FILE_EXT_REGEX, "").replace(SPECIAL_CHAR_REGEX, " ") || "image";
    const finalMarkdown = `\n![${altText}](${url})\n`;

    const latestVal = params.getCurrentValue();
    const scrollYBeforeFinish = typeof window !== "undefined" ? window.scrollY : 0;

    if (latestVal.includes(placeholderToken)) {
      params.setFieldValue(latestVal.replace(placeholderToken, finalMarkdown), true);
    } else {
      const clamped = Math.min(safeOffset, latestVal.length);
      params.setFieldValue(`${latestVal.slice(0, clamped)}${finalMarkdown}${latestVal.slice(clamped)}`, true);
    }

    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollYBeforeFinish || savedScrollY, behavior: "instant" as ScrollBehavior });
      });
    }
  } catch (err) {
    const latestVal = params.getCurrentValue();
    if (latestVal.includes(placeholderToken)) {
      params.setFieldValue(latestVal.replace(placeholderToken, ""), false);
    }
    params.onError(`Tải ảnh thất bại: ${err instanceof Error ? err.message : "Lỗi không xác định"}`);
  } finally {
    params.onFinish();
  }
}

export const EDITOR_COLORS = [
  { name: "Mặc định", value: "" },
  { name: "Cam MPC", value: "#f97316" },
  { name: "Đỏ", value: "#ef4444" },
  { name: "Vàng", value: "#f59e0b" },
  { name: "Xanh lá", value: "#22c55e" },
  { name: "Xanh ngọc", value: "#06b6d4" },
  { name: "Xanh dương", value: "#3b82f6" },
  { name: "Tím", value: "#8b5cf6" },
  { name: "Hồng", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Xám", value: "#6b7280" },
  { name: "Trắng", value: "#ffffff" }
];

export type EditorFormatActions = {
  insertWrap: (prefix: string, suffix: string, fallbackText?: string) => void;
  insertAlignment: (align: "left" | "center" | "right" | "justify") => void;
  insertColor: (color: string) => void;
  insertTable: () => void;
  triggerImageUpload: () => void;
};

export type SelectionBubbleState = {
  visible: boolean;
  x: number;
  y: number;
};

export type ContextMenuState = {
  visible: boolean;
  x: number;
  y: number;
};

export function applyWrapToTextarea(
  textarea: HTMLTextAreaElement,
  value: string,
  prefix: string,
  suffix: string,
  fallbackText = "văn bản"
): { nextValue: string; nextCursorStart: number; nextCursorEnd: number } {
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const selected = value.slice(start, end);
  const content = selected || fallbackText;
  const before = value.slice(0, start);
  const after = value.slice(end);
  const nextValue = `${before}${prefix}${content}${suffix}${after}`;
  const innerStart = start + prefix.length;
  const innerEnd = innerStart + content.length;
  return {
    nextValue,
    nextCursorStart: selected ? innerEnd + suffix.length : innerStart,
    nextCursorEnd: selected ? innerEnd + suffix.length : innerEnd
  };
}

export function applyAlignmentToTextarea(
  textarea: HTMLTextAreaElement,
  value: string,
  align: "left" | "center" | "right" | "justify"
): { nextValue: string; nextCursorPos: number } {
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || "Nội dung";
  const before = value.slice(0, start);
  const after = value.slice(end);
  const wrapped = `<div style="text-align: ${align}">\n\n${selected}\n\n</div>`;
  const nextValue = `${before}${wrapped}${after}`;
  return {
    nextValue,
    nextCursorPos: start + wrapped.length
  };
}

export function applyColorToTextarea(
  textarea: HTMLTextAreaElement,
  value: string,
  color: string
): { nextValue: string; nextCursorPos: number } {
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || "văn bản";
  const before = value.slice(0, start);
  const after = value.slice(end);
  const wrapped = color === "" ? selected : `<span style="color: ${color}">${selected}</span>`;
  const nextValue = `${before}${wrapped}${after}`;
  return {
    nextValue,
    nextCursorPos: start + wrapped.length
  };
}

export function restoreTextareaCursorWithoutScrollJump(
  textarea: HTMLTextAreaElement | null,
  cursorStart: number,
  cursorEnd: number,
  savedWindowScrollY: number,
  savedTextareaScrollTop: number
) {
  if (!textarea) {
    return;
  }
  requestAnimationFrame(() => {
    try {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(cursorStart, cursorEnd);
      textarea.scrollTop = savedTextareaScrollTop;
    } catch {
      // ignore selection range errors on unmounted nodes
    }
    window.scrollTo({ top: savedWindowScrollY, behavior: "instant" as ScrollBehavior });
  });
}

export const FORMAT_BUTTONS = [
  { icon: Bold, prefix: "**", suffix: "**", title: "In đậm (Bold)" },
  { icon: Italic, prefix: "_", suffix: "_", title: "In nghiêng (Italic)" },
  { icon: Heading2, prefix: "## ", suffix: "", title: "Tiêu đề H2" },
  { icon: Heading3, prefix: "### ", suffix: "", title: "Tiêu đề H3" },
  { icon: Link, prefix: "[", suffix: "](https://)", title: "Chèn liên kết (Link)" },
  { icon: Code, prefix: "`", suffix: "`", title: "Code inline" },
  { icon: SquareCode, prefix: "\n```\n", suffix: "\n```\n", title: "Khối code" },
  { icon: Quote, prefix: "> ", suffix: "", title: "Trích dẫn (Quote)" },
  { icon: List, prefix: "- ", suffix: "", title: "Danh sách" },
  { icon: ListOrdered, prefix: "1. ", suffix: "", title: "Danh sách đánh số" },
  { icon: CheckSquare, prefix: "- [ ] ", suffix: "", title: "Checklist" },
  { icon: Minus, prefix: "\n---\n", suffix: "", title: "Đường kẻ ngang" }
];

export function EditorSelectionBubble({
  state,
  actions,
  onClose
}: {
  state: SelectionBubbleState;
  actions: EditorFormatActions;
  onClose: () => void;
}) {
  if (!state.visible) {
    return null;
  }

  const run = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
    onClose();
  };

  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      className='fade-in zoom-in-95 fixed z-50 flex animate-in flex-wrap items-center gap-0.5 rounded-xl border border-border/80 bg-popover/95 px-2 py-1.5 text-popover-foreground shadow-2xl backdrop-blur-md duration-150'
      style={{
        left: `${Math.max(16, Math.min(state.x, typeof window !== "undefined" ? window.innerWidth - 360 : state.x))}px`,
        top: `${Math.max(12, state.y - 48)}px`
      }}
    >
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertWrap("**", "**"))}
        onMouseDown={keepFocus}
        title='In đậm'
        type='button'
      >
        <Bold className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertWrap("_", "_"))}
        onMouseDown={keepFocus}
        title='In nghiêng'
        type='button'
      >
        <Italic className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertWrap("## ", ""))}
        onMouseDown={keepFocus}
        title='Tiêu đề H2'
        type='button'
      >
        <Heading2 className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertWrap("### ", ""))}
        onMouseDown={keepFocus}
        title='Tiêu đề H3'
        type='button'
      >
        <Heading3 className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertWrap("[", "](https://)"))}
        onMouseDown={keepFocus}
        title='Gắn link'
        type='button'
      >
        <Link className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertWrap("`", "`"))}
        onMouseDown={keepFocus}
        title='Code inline'
        type='button'
      >
        <Code className='h-3.5 w-3.5' />
      </button>

      <span className='mx-0.5 h-4 w-px bg-border' />

      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertAlignment("left"))}
        onMouseDown={keepFocus}
        title='Căn trái'
        type='button'
      >
        <AlignLeft className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertAlignment("center"))}
        onMouseDown={keepFocus}
        title='Căn giữa'
        type='button'
      >
        <AlignCenter className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertAlignment("right"))}
        onMouseDown={keepFocus}
        title='Căn phải'
        type='button'
      >
        <AlignRight className='h-3.5 w-3.5' />
      </button>
      <button
        className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        onClick={run(() => actions.insertAlignment("justify"))}
        onMouseDown={keepFocus}
        title='Căn đều'
        type='button'
      >
        <AlignJustify className='h-3.5 w-3.5' />
      </button>

      <span className='mx-0.5 h-4 w-px bg-border' />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            onMouseDown={(e) => e.preventDefault()}
            title='Màu chữ'
            type='button'
          >
            <Palette className='h-3.5 w-3.5' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='center' className='grid w-48 grid-cols-4 gap-1.5 p-2'>
          {EDITOR_COLORS.map((c) => (
            <DropdownMenuItem
              className='flex cursor-pointer flex-col items-center justify-center rounded p-1.5'
              key={c.name}
              onClick={() => {
                actions.insertColor(c.value);
                onClose();
              }}
            >
              <span
                className='h-4 w-4 rounded-full border border-border'
                style={{ backgroundColor: c.value || "var(--foreground)" }}
              />
              <span className='mt-1 truncate text-[10px]'>{c.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function EditorContextMenu({
  state,
  actions,
  onClose
}: {
  state: ContextMenuState;
  actions: EditorFormatActions;
  onClose: () => void;
}) {
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    if (!state.visible) {
      setShowColors(false);
      return;
    }
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-editor-context-menu='true']")) {
        return;
      }
      onClose();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [state.visible, onClose]);

  if (!state.visible) {
    return null;
  }

  const run = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
    onClose();
  };

  const maxX = typeof window !== "undefined" ? window.innerWidth - 240 : state.x;
  const maxY = typeof window !== "undefined" ? window.innerHeight - 360 : state.y;

  return (
    <div
      className='fade-in zoom-in-95 fixed z-50 w-56 animate-in rounded-xl border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-2xl backdrop-blur-md duration-100'
      data-editor-context-menu='true'
      style={{
        left: `${Math.max(12, Math.min(state.x, maxX))}px`,
        top: `${Math.max(12, Math.min(state.y, maxY))}px`
      }}
    >
      <div className='px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider'>
        Định dạng nhanh
      </div>
      <div className='mb-1 flex items-center justify-between gap-0.5 rounded-lg bg-muted/40 px-1 py-1'>
        <button
          className='cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertWrap("**", "**"))}
          title='In đậm'
          type='button'
        >
          <Bold className='h-3.5 w-3.5' />
        </button>
        <button
          className='cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertWrap("_", "_"))}
          title='In nghiêng'
          type='button'
        >
          <Italic className='h-3.5 w-3.5' />
        </button>
        <button
          className='cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertWrap("## ", ""))}
          title='Tiêu đề H2'
          type='button'
        >
          <Heading2 className='h-3.5 w-3.5' />
        </button>
        <button
          className='cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertWrap("### ", ""))}
          title='Tiêu đề H3'
          type='button'
        >
          <Heading3 className='h-3.5 w-3.5' />
        </button>
        <button
          className='cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertWrap("[", "](https://)"))}
          title='Chèn link'
          type='button'
        >
          <Link className='h-3.5 w-3.5' />
        </button>
        <button
          className='cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertWrap("> ", ""))}
          title='Trích dẫn'
          type='button'
        >
          <Quote className='h-3.5 w-3.5' />
        </button>
      </div>

      <div className='px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider'>Căn lề</div>
      <div className='mb-1 grid grid-cols-4 gap-1 rounded-lg bg-muted/40 p-1'>
        <button
          className='flex cursor-pointer flex-col items-center gap-0.5 rounded py-1 text-[10px] text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertAlignment("left"))}
          type='button'
        >
          <AlignLeft className='h-3.5 w-3.5' />
          <span>Trái</span>
        </button>
        <button
          className='flex cursor-pointer flex-col items-center gap-0.5 rounded py-1 text-[10px] text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertAlignment("center"))}
          type='button'
        >
          <AlignCenter className='h-3.5 w-3.5' />
          <span>Giữa</span>
        </button>
        <button
          className='flex cursor-pointer flex-col items-center gap-0.5 rounded py-1 text-[10px] text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertAlignment("right"))}
          type='button'
        >
          <AlignRight className='h-3.5 w-3.5' />
          <span>Phải</span>
        </button>
        <button
          className='flex cursor-pointer flex-col items-center gap-0.5 rounded py-1 text-[10px] text-muted-foreground hover:bg-background hover:text-foreground'
          onClick={run(() => actions.insertAlignment("justify"))}
          type='button'
        >
          <AlignJustify className='h-3.5 w-3.5' />
          <span>Đều</span>
        </button>
      </div>

      <div className='my-1 h-px bg-border/60' />

      <button
        className='flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted'
        onClick={run(() => actions.triggerImageUpload())}
        type='button'
      >
        <ImagePlus className='h-4 w-4 text-primary' />
        <span className='font-medium'>Tải ảnh lên vị trí con trỏ</span>
      </button>

      <button
        className='flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted'
        onClick={run(() => actions.insertTable())}
        type='button'
      >
        <Table className='h-4 w-4 text-primary/80' />
        <span>Chèn bảng (Table)</span>
      </button>

      <button
        className='flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted'
        onClick={run(() => actions.insertWrap("\n```\n", "\n```\n", "// code"))}
        type='button'
      >
        <SquareCode className='h-4 w-4 text-primary/80' />
        <span>Chèn khối Code</span>
      </button>

      <button
        className='flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted'
        onClick={run(() => actions.insertWrap("\n---\n", "", ""))}
        type='button'
      >
        <Minus className='h-4 w-4 text-muted-foreground' />
        <span>Chèn đường kẻ ngang</span>
      </button>

      <button
        className='flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowColors((prev) => !prev);
        }}
        type='button'
      >
        <span className='flex items-center gap-2.5'>
          <Palette className='h-4 w-4 text-primary/80' />
          <span>Đổi màu chữ</span>
        </span>
        <span className='text-[10px] text-muted-foreground'>{showColors ? "▲" : "▼"}</span>
      </button>

      {showColors && (
        <div className='mt-1 grid grid-cols-6 gap-1.5 rounded-lg bg-muted/40 p-2'>
          {EDITOR_COLORS.map((c) => (
            <button
              className='flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border transition-transform hover:scale-110'
              key={c.name}
              onClick={run(() => actions.insertColor(c.value))}
              style={{ backgroundColor: c.value || "var(--foreground)" }}
              title={c.name}
              type='button'
            />
          ))}
        </div>
      )}
    </div>
  );
}
