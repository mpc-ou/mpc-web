"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Palette,
  Pencil,
  Quote,
  Redo2,
  SquareCode,
  Table,
  Undo2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminRegisterTempImage } from "@/app/_actions/admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { STORAGE_BUCKET } from "@/constants/storage";
import { UPLOAD_MAX_IMAGE_SIZE } from "@/constants/upload";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/utils/supabase-upload";
import { MarkdownBlock } from "./markdown-block";

const FILE_EXT_REGEX = /\.[^.]+$/;
const SPECIAL_CHAR_REGEX = /[-_]/g;

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: string;
  onChange?: (value: string) => void;
};

const BASIC_COLORS = [
  { name: "Mặc định", value: "" },
  { name: "Đỏ", value: "#ef4444" },
  { name: "Cam", value: "#f97316" },
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

export const MarkdownEditor = ({
  name,
  defaultValue = "",
  placeholder = "Viết nội dung Markdown...",
  minHeight = "350px",
  onChange
}: MarkdownEditorProps) => {
  const { toast } = useToast();
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Undo/Redo State History
  const historyRef = useRef<string[]>([defaultValue]);
  const historyIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const handleChange = useCallback(
    (v: string, pushHistory = true) => {
      setValue(v);
      onChange?.(v);

      if (pushHistory) {
        const currentHist = historyRef.current.slice(0, historyIndexRef.current + 1);
        currentHist.push(v);
        if (currentHist.length > 100) {
          currentHist.shift();
        }
        historyRef.current = currentHist;
        historyIndexRef.current = currentHist.length - 1;
      }
      updateHistoryState();
    },
    [onChange, updateHistoryState]
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevValue = historyRef.current[historyIndexRef.current];
      setValue(prevValue);
      onChange?.(prevValue);
      updateHistoryState();
    }
  }, [onChange, updateHistoryState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextValue = historyRef.current[historyIndexRef.current];
      setValue(nextValue);
      onChange?.(nextValue);
      updateHistoryState();
    }
  }, [onChange, updateHistoryState]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      handleUndo();
    } else if (
      (e.ctrlKey || e.metaKey) &&
      (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))
    ) {
      e.preventDefault();
      handleRedo();
    }
  };

  const getTextarea = (): HTMLTextAreaElement | null => textareaRef.current;

  const insertAtCursor = (text: string) => {
    const textarea = getTextarea();
    if (!textarea) {
      handleChange(value + text);
      return;
    }
    const start = textarea.selectionStart;
    const before = value.substring(0, start);
    const after = value.substring(start);
    const newValue = `${before}${text}${after}`;
    handleChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + text.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const insertMarkdown = (prefix: string, suffix: string) => {
    const textarea = getTextarea();
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = `${before}${prefix}${selected || "văn bản"}${suffix}${after}`;
    handleChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + prefix.length + (selected || "văn bản").length + suffix.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const insertTable = () => {
    const tableMarkdown =
      "\n| Cột 1 | Cột 2 | Cột 3 |\n| ----- | ----- | ----- |\n| A     | B     | C     |\n| D     | E     | F     |\n";
    insertAtCursor(tableMarkdown);
  };

  const insertAlignment = (align: "left" | "center" | "right" | "justify") => {
    const textarea = getTextarea();
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || "Nội dung";
    const before = value.substring(0, start);
    const after = value.substring(end);
    const wrapped = `<div style="text-align: ${align}">\n\n${selected}\n\n</div>`;
    const newValue = `${before}${wrapped}${after}`;
    handleChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
    });
  };

  const insertColor = (color: string) => {
    const textarea = getTextarea();
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || "văn bản";
    const before = value.substring(0, start);
    const after = value.substring(end);

    const wrapped = color === "" ? selected : `<span style="color: ${color}">${selected}</span>`;

    const newValue = `${before}${wrapped}${after}`;
    handleChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos =
        start +
        (color === "" ? 0 : `<span style="color: ${color}">`.length) +
        selected.length +
        (color === "" ? 0 : "</span>".length);
      textarea.setSelectionRange(pos, pos);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        description: "Chỉ chấp nhận file ảnh (jpg, png, gif, webp)"
      });
      return;
    }
    if (file.size > UPLOAD_MAX_IMAGE_SIZE) {
      toast({
        variant: "destructive",
        description: "File quá lớn (tối đa 5MB)"
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "editor");
      await adminRegisterTempImage(url);
      const altText = file.name.replace(FILE_EXT_REGEX, "").replace(SPECIAL_CHAR_REGEX, " ");
      insertAtCursor(`\n![${altText}](${url})\n`);
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Upload thất bại: ${err instanceof Error ? err.message : "Unknown error"}`
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const toolbarItems = [
    { icon: Bold, prefix: "**", suffix: "**", title: "In đậm" },
    { icon: Italic, prefix: "_", suffix: "_", title: "In nghiêng" },
    { icon: Heading2, prefix: "## ", suffix: "", title: "Tiêu đề 2" },
    { icon: Heading3, prefix: "### ", suffix: "", title: "Tiêu đề 3" },
    { icon: Link, prefix: "[", suffix: "](url)", title: "Liên kết" },
    { icon: Code, prefix: "`", suffix: "`", title: "Code inline" },
    { icon: SquareCode, prefix: "```\n", suffix: "\n```", title: "Khối code" },
    { icon: Quote, prefix: "> ", suffix: "", title: "Trích dẫn" },
    { icon: List, prefix: "- ", suffix: "", title: "Danh sách" },
    { icon: ListOrdered, prefix: "1. ", suffix: "", title: "Đánh số" },
    { icon: CheckSquare, prefix: "- [ ] ", suffix: "", title: "Checkbox" },
    { icon: Minus, prefix: "\n---\n", suffix: "", title: "Đường kẻ" }
  ];

  return (
    <div className='flex flex-col overflow-hidden rounded-lg border border-border bg-card'>
      {/* Tab bar + Toolbar */}
      <div className='flex flex-wrap items-center gap-1.5 border-border border-b bg-muted/40 px-3 py-2'>
        <div className='flex items-center rounded-md border border-border bg-background p-0.5 shadow-xs'>
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 font-medium text-xs transition-colors ${
              tab === "write" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("write")}
            type='button'
          >
            <Pencil className='h-3 w-3' />
            Viết
          </button>
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 font-medium text-xs transition-colors ${
              tab === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("preview")}
            type='button'
          >
            <Eye className='h-3 w-3' />
            Xem trước
          </button>
        </div>

        {tab === "write" && (
          <>
            <span className='h-5 w-px bg-border' />

            {/* Undo/Redo Group */}
            <div className='flex items-center gap-0.5'>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
                disabled={!canUndo}
                onClick={handleUndo}
                title='Hoàn tác (Ctrl+Z)'
                type='button'
              >
                <Undo2 className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
                disabled={!canRedo}
                onClick={handleRedo}
                title='Làm lại (Ctrl+Y)'
                type='button'
              >
                <Redo2 className='h-3.5 w-3.5' />
              </button>
            </div>

            <span className='h-5 w-px bg-border' />

            {/* Formats Group */}
            <div className='flex flex-wrap items-center gap-0.5'>
              {toolbarItems.map((item, idx) => (
                <button
                  className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  key={idx}
                  onClick={() => insertMarkdown(item.prefix, item.suffix)}
                  title={item.title}
                  type='button'
                >
                  <item.icon className='h-3.5 w-3.5' />
                </button>
              ))}
            </div>

            <span className='h-5 w-px bg-border' />

            {/* Alignment Group */}
            <div className='flex items-center gap-0.5'>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                onClick={() => insertAlignment("left")}
                title='Căn trái'
                type='button'
              >
                <AlignLeft className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                onClick={() => insertAlignment("center")}
                title='Căn giữa'
                type='button'
              >
                <AlignCenter className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                onClick={() => insertAlignment("right")}
                title='Căn phải'
                type='button'
              >
                <AlignRight className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                onClick={() => insertAlignment("justify")}
                title='Căn đều'
                type='button'
              >
                <AlignJustify className='h-3.5 w-3.5' />
              </button>
            </div>

            <span className='h-5 w-px bg-border' />

            {/* Extra Features Group */}
            <div className='flex items-center gap-1'>
              {/* Color Dropper */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    title='Màu chữ'
                    type='button'
                  >
                    <Palette className='h-3.5 w-3.5' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='start'
                  className='grid w-48 grid-cols-4 gap-1.5 rounded-md border border-border bg-popover p-2 shadow-lg'
                >
                  {BASIC_COLORS.map((c) => (
                    <DropdownMenuItem
                      className='flex cursor-pointer flex-col items-center justify-center rounded p-1.5 transition-colors hover:bg-muted focus:bg-muted'
                      key={c.name}
                      onClick={() => insertColor(c.value)}
                      title={c.name}
                    >
                      <span
                        className='h-5 w-5 rounded-full border border-border shadow-xs'
                        style={{
                          backgroundColor: c.value || "var(--foreground)"
                        }}
                      />
                      <span className='mt-1 max-w-full truncate text-[10px] text-muted-foreground'>{c.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Table */}
              <button
                className='flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground'
                onClick={insertTable}
                title='Chèn bảng'
                type='button'
              >
                <Table className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>Bảng</span>
              </button>

              {/* Image upload button */}
              <button
                className='flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50'
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                title='Upload ảnh'
                type='button'
              >
                {uploading ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <ImagePlus className='h-3.5 w-3.5' />}
                <span>{uploading ? "Đang upload..." : "Ảnh"}</span>
              </button>
              <input accept='image/*' className='hidden' onChange={handleImageUpload} ref={fileInputRef} type='file' />
            </div>
          </>
        )}
      </div>

      {/* Content area */}
      {tab === "write" ? (
        <textarea
          className='w-full resize-y bg-background px-4 py-3 font-mono text-foreground text-sm leading-relaxed focus:outline-hidden'
          name={name}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={textareaRef}
          style={{ minHeight }}
          value={value}
        />
      ) : (
        <div className='overflow-y-auto bg-background px-4 py-3' style={{ minHeight }}>
          {value.trim() ? (
            <MarkdownBlock content={value} />
          ) : (
            <p className='text-muted-foreground text-sm italic'>Chưa có nội dung xem trước</p>
          )}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input name={`${name}_hidden`} type='hidden' value={value} />
    </div>
  );
};
