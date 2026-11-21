"use client";

import { Eye, ImagePlus, Loader2, Pencil, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownBlock } from "@/components/markdown-block";
import { MarkdownInline } from "@/components/markdown-inline";
import { UPLOAD_MAX_BANNER_SIZE } from "@/constants/upload";
import { useToast } from "@/hooks/use-toast";
import { uploadToStorage } from "@/services/supabase-upload";
import {
  applyAlignmentToTextarea,
  applyColorToTextarea,
  applyWrapToTextarea,
  type ContextMenuState,
  EditorContextMenu,
  type EditorFormatActions,
  EditorSelectionBubble,
  executeInlineImageUploadTask,
  restoreTextareaCursorWithoutScrollJump,
  type SelectionBubbleState
} from "./editor-floating-menus";
import { VisualMarkdownBlocks } from "./visual-markdown-blocks";
import type { ActiveField, EditorMode } from "./workspace-top-toolbar";

const NEWLINE_REGEX = /[\r\n]+/g;

export type UnifiedDocumentCanvasProps = {
  bannerUrl: string | null;
  onBannerChange: (url: string | null) => void;
  bannerBucket: string;
  bannerStoragePath: string;
  bannerLabel?: string;
  title: string;
  onTitleChange: (nextTitle: string) => void;
  titlePlaceholder?: string;
  titleFallbackBadge?: string | null;
  summary: string;
  onSummaryChange: (nextSummary: string) => void;
  summaryPlaceholder?: string;
  summaryFallbackBadge?: string | null;
  content: string;
  onContentChange: (nextContent: string) => void;
  contentPlaceholder?: string;
  activeField: ActiveField;
  onActiveFieldChange: (field: ActiveField) => void;
  editorMode: EditorMode;
  onRegisterFormatActions: (
    actions: EditorFormatActions,
    uploadingState: { uploading: boolean; percent: number | null }
  ) => void;
  inlineMetaBar?: React.ReactNode;
};

export function UnifiedDocumentCanvas({
  bannerUrl,
  onBannerChange,
  bannerBucket,
  bannerStoragePath,
  bannerLabel = "Ảnh bìa / Banner bài viết (Kéo thả hoặc nhấp để tải lên)",
  title,
  onTitleChange,
  titlePlaceholder = "Nhập tiêu đề bài viết...",
  titleFallbackBadge,
  summary,
  onSummaryChange,
  summaryPlaceholder = "Mô tả ngắn / Tóm tắt (hỗ trợ Markdown, có thể để trống để tự lấy đoạn đầu bài viết)...",
  summaryFallbackBadge,
  content,
  onContentChange,
  contentPlaceholder = "Viết nội dung bài viết (hỗ trợ Markdown, kéo thả hoặc Ctrl+V để dán ảnh trực tiếp)...",
  activeField,
  onActiveFieldChange,
  editorMode,
  onRegisterFormatActions,
  inlineMetaBar
}: UnifiedDocumentCanvasProps) {
  const { toast } = useToast();

  // Banner upload state
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerPercent, setBannerPercent] = useState<number>(0);
  const [bannerDragOver, setBannerDragOver] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // Inline content image upload state
  const [contentUploading, setContentUploading] = useState(false);
  const [contentUploadPercent, setContentUploadPercent] = useState<number | null>(null);
  const contentImageInputRef = useRef<HTMLInputElement | null>(null);

  // Refs for textareas and latest values
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const latestSummaryRef = useRef(summary);
  latestSummaryRef.current = summary;
  const latestContentRef = useRef(content);
  latestContentRef.current = content;
  const latestActiveFieldRef = useRef(activeField);
  latestActiveFieldRef.current = activeField;
  const latestEditorModeRef = useRef(editorMode);
  latestEditorModeRef.current = editorMode;
  const onSummaryChangeRef = useRef(onSummaryChange);
  onSummaryChangeRef.current = onSummaryChange;
  const onContentChangeRef = useRef(onContentChange);
  onContentChangeRef.current = onContentChange;
  const onRegisterRef = useRef(onRegisterFormatActions);
  onRegisterRef.current = onRegisterFormatActions;

  // Saved cursor offset before opening file dialog
  const savedInsertTargetRef = useRef<{
    field: "summary" | "content";
    offset: number;
    windowScrollY: number;
    textareaScrollTop: number;
  }>({
    field: "content",
    offset: content.length,
    windowScrollY: 0,
    textareaScrollTop: 0
  });

  // Preview-edit toggle for Summary
  const [editingSummaryInPreview, setEditingSummaryInPreview] = useState(false);

  // Floating selection bubble & right-click context menu state
  const [bubbleState, setBubbleState] = useState<SelectionBubbleState>({
    visible: false,
    x: 0,
    y: 0
  });
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0
  });

  // Auto-resize title, summary, and raw content textareas without jumping window scroll
  const autoResizeTextarea = useCallback((el: HTMLTextAreaElement | null, minPx: number) => {
    if (!el) {
      return;
    }
    const savedScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    el.style.height = "auto";
    el.style.height = `${Math.max(minPx, el.scrollHeight)}px`;
    if (typeof window !== "undefined") {
      window.scrollTo({ top: savedScrollY, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  useEffect(() => {
    autoResizeTextarea(titleRef.current, 52);
    autoResizeTextarea(summaryRef.current, 64);
    if (editorMode === "raw-edit") {
      autoResizeTextarea(contentRef.current, 460);
    }
  });

  const getTargetTextareaAndField = useCallback((): {
    textarea: HTMLTextAreaElement | null;
    field: "summary" | "content";
    value: string;
    onChange: (v: string) => void;
  } => {
    if (latestActiveFieldRef.current === "summary") {
      return {
        textarea: summaryRef.current,
        field: "summary",
        value: latestSummaryRef.current,
        onChange: (v: string) => onSummaryChangeRef.current(v)
      };
    }
    return {
      textarea: latestEditorModeRef.current === "raw-edit" ? contentRef.current : activeTextareaRef.current,
      field: "content",
      value: latestContentRef.current,
      onChange: (v: string) => onContentChangeRef.current(v)
    };
  }, []);

  // Upload and insert image at exact saved cursor offset without scroll jump
  const uploadAndInsertImageFile = useCallback(
    async (file: File, explicitTarget?: { field: "summary" | "content"; offset: number }) => {
      const targetField = explicitTarget?.field ?? savedInsertTargetRef.current.field;
      const insertOffset = explicitTarget?.offset ?? savedInsertTargetRef.current.offset;

      await executeInlineImageUploadTask({
        file,
        insertOffset,
        getCurrentValue: () => (targetField === "summary" ? latestSummaryRef.current : latestContentRef.current),
        setFieldValue: (nextVal) => {
          if (targetField === "summary") {
            onSummaryChangeRef.current(nextVal);
          } else {
            onContentChangeRef.current(nextVal);
          }
        },
        onStart: () => {
          setContentUploading(true);
          setContentUploadPercent(1);
        },
        onProgress: (pct) => setContentUploadPercent(pct),
        onFinish: () => {
          setContentUploading(false);
          setContentUploadPercent(null);
          if (contentImageInputRef.current) {
            contentImageInputRef.current.value = "";
          }
        },
        onError: (msg) => toast({ variant: "destructive", description: msg })
      });
    },
    [toast]
  );

  // Formatting actions exposed to Top Toolbar, Floating Selection Bubble, and Context Menu
  const insertWrap = useCallback(
    (prefix: string, suffix: string, fallbackText = "văn bản") => {
      if (latestActiveFieldRef.current === "title") {
        return;
      }
      const { textarea, value, onChange } = getTargetTextareaAndField();
      const savedWindowY = typeof window !== "undefined" ? window.scrollY : 0;
      const savedScrollTop = textarea?.scrollTop ?? 0;

      if (!textarea) {
        onChange(`${value}${prefix}${fallbackText}${suffix}`);
        return;
      }

      const { nextValue, nextCursorStart, nextCursorEnd } = applyWrapToTextarea(
        textarea,
        value,
        prefix,
        suffix,
        fallbackText
      );
      onChange(nextValue);
      restoreTextareaCursorWithoutScrollJump(textarea, nextCursorStart, nextCursorEnd, savedWindowY, savedScrollTop);
    },
    [getTargetTextareaAndField]
  );

  const insertAlignment = useCallback(
    (align: "left" | "center" | "right" | "justify") => {
      if (latestActiveFieldRef.current === "title") {
        return;
      }
      const { textarea, value, onChange } = getTargetTextareaAndField();
      const savedWindowY = typeof window !== "undefined" ? window.scrollY : 0;
      const savedScrollTop = textarea?.scrollTop ?? 0;

      if (!textarea) {
        onChange(`${value}\n<div style="text-align: ${align}">\n\nNội dung\n\n</div>\n`);
        return;
      }

      const { nextValue, nextCursorPos } = applyAlignmentToTextarea(textarea, value, align);
      onChange(nextValue);
      restoreTextareaCursorWithoutScrollJump(textarea, nextCursorPos, nextCursorPos, savedWindowY, savedScrollTop);
    },
    [getTargetTextareaAndField]
  );

  const insertColor = useCallback(
    (color: string) => {
      if (latestActiveFieldRef.current === "title") {
        return;
      }
      const { textarea, value, onChange } = getTargetTextareaAndField();
      const savedWindowY = typeof window !== "undefined" ? window.scrollY : 0;
      const savedScrollTop = textarea?.scrollTop ?? 0;

      if (!textarea) {
        return;
      }

      const { nextValue, nextCursorPos } = applyColorToTextarea(textarea, value, color);
      onChange(nextValue);
      restoreTextareaCursorWithoutScrollJump(textarea, nextCursorPos, nextCursorPos, savedWindowY, savedScrollTop);
    },
    [getTargetTextareaAndField]
  );

  const insertTable = useCallback(() => {
    const tableSnippet =
      "\n| Cột 1 | Cột 2 | Cột 3 |\n| ----- | ----- | ----- |\n| Nội dung A | Nội dung B | Nội dung C |\n";
    insertWrap(tableSnippet, "", "");
  }, [insertWrap]);

  const triggerImageUpload = useCallback(() => {
    const { textarea, field, value } = getTargetTextareaAndField();
    savedInsertTargetRef.current = {
      field,
      offset: textarea ? (textarea.selectionStart ?? value.length) : value.length,
      windowScrollY: typeof window !== "undefined" ? window.scrollY : 0,
      textareaScrollTop: textarea?.scrollTop ?? 0
    };
    contentImageInputRef.current?.click();
  }, [getTargetTextareaAndField]);

  useEffect(() => {
    onRegisterRef.current(
      {
        insertWrap,
        insertAlignment,
        insertColor,
        insertTable,
        triggerImageUpload
      },
      {
        uploading: contentUploading,
        percent: contentUploadPercent
      }
    );
  }, [
    insertWrap,
    insertAlignment,
    insertColor,
    insertTable,
    triggerImageUpload,
    contentUploading,
    contentUploadPercent
  ]);

  // Handle text selection for Floating Bubble
  const handleTextareaSelection = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (end - start > 0) {
      const rect = el.getBoundingClientRect();
      setBubbleState({
        visible: true,
        x: rect.left + Math.min(rect.width / 2, 240),
        y: Math.max(80, rect.top + 12)
      });
    } else {
      setBubbleState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }
  }, []);

  const handleMouseUpWithCoords = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (end - start > 0) {
      setBubbleState({
        visible: true,
        x: e.clientX - 120,
        y: e.clientY - 12
      });
    } else {
      setBubbleState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }
  }, []);

  const handleContextMenu = useCallback(
    (field: "summary" | "content") => (e: React.MouseEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      onActiveFieldChange(field);
      const el = e.currentTarget;
      savedInsertTargetRef.current = {
        field,
        offset: el.selectionStart ?? el.value.length,
        windowScrollY: window.scrollY,
        textareaScrollTop: el.scrollTop
      };
      setBubbleState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      setContextMenuState({
        visible: true,
        x: e.clientX,
        y: e.clientY
      });
    },
    [onActiveFieldChange]
  );

  // Handle paste image (Ctrl+V) in Summary or Content
  const handlePasteInEditor = useCallback(
    (field: "summary" | "content") => (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) {
        return;
      }
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const el = e.currentTarget;
            const offset = el.selectionStart ?? el.value.length;
            uploadAndInsertImageFile(file, { field, offset });
            return;
          }
        }
      }
    },
    [uploadAndInsertImageFile]
  );

  // Banner upload handler with progress
  const processBannerFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", description: "Chỉ chấp nhận file ảnh" });
      return;
    }
    if (file.size > UPLOAD_MAX_BANNER_SIZE) {
      toast({ variant: "destructive", description: "Ảnh bìa tối đa 8MB" });
      return;
    }
    setBannerUploading(true);
    setBannerPercent(1);
    try {
      const url = await uploadToStorage(file, bannerBucket, bannerStoragePath, (pct) => {
        setBannerPercent(pct);
      });
      onBannerChange(url);
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : "Upload ảnh bìa thất bại"
      });
    } finally {
      setBannerUploading(false);
      setBannerPercent(0);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  };

  return (
    <div className='relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm'>
      {/* Floating Selection Bubble & Right-Click Context Menu */}
      <EditorSelectionBubble
        actions={{
          insertWrap,
          insertAlignment,
          insertColor,
          insertTable,
          triggerImageUpload
        }}
        onClose={() => setBubbleState((prev) => ({ ...prev, visible: false }))}
        state={bubbleState}
      />

      <EditorContextMenu
        actions={{
          insertWrap,
          insertAlignment,
          insertColor,
          insertTable,
          triggerImageUpload
        }}
        onClose={() => setContextMenuState((prev) => ({ ...prev, visible: false }))}
        state={contextMenuState}
      />

      {/* Hidden file input for inline editor images */}
      <input
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadAndInsertImageFile(file);
          }
        }}
        ref={contentImageInputRef}
        type='file'
      />

      {/* Floating Upload Progress Toast inside Canvas */}
      {contentUploading && (
        <div className='fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-xl border border-primary/40 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-md'>
          <Loader2 className='h-4 w-4 animate-spin text-primary' />
          <div className='min-w-44'>
            <div className='flex items-center justify-between font-medium text-xs'>
              <span>Đang tải ảnh vào bài viết...</span>
              <span className='font-mono text-primary'>{contentUploadPercent ?? 0}%</span>
            </div>
            <div className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className='h-full bg-primary transition-all duration-150'
                style={{ width: `${contentUploadPercent ?? 5}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 1. COVER / BANNER SECTION */}
      <div className='border-border/60 border-b bg-muted/20 p-4 sm:p-6'>
        {bannerUrl ? (
          <div className='group relative aspect-21/9 max-h-72 w-full overflow-hidden rounded-xl border bg-muted'>
            <Image alt='Cover banner' className='object-cover' fill sizes='900px' src={bannerUrl} />
            <div className='absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
            <div className='absolute top-3 right-3 flex items-center gap-2'>
              <button
                className='flex cursor-pointer items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 font-medium text-white text-xs backdrop-blur-xs transition hover:bg-black/85'
                onClick={() => bannerInputRef.current?.click()}
                type='button'
              >
                <ImagePlus className='h-3.5 w-3.5' />
                Đổi ảnh bìa
              </button>
              <button
                className='cursor-pointer rounded-full bg-black/65 p-1.5 text-white backdrop-blur-xs transition hover:bg-red-600'
                onClick={() => onBannerChange(null)}
                title='Xóa ảnh bìa'
                type='button'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>
        ) : (
          <button
            className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all disabled:opacity-50 ${
              bannerDragOver
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/80 bg-background/50 text-muted-foreground hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
            }`}
            disabled={bannerUploading}
            onClick={() => bannerInputRef.current?.click()}
            onDragLeave={(e) => {
              e.preventDefault();
              setBannerDragOver(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setBannerDragOver(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setBannerDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                processBannerFile(e.dataTransfer.files[0]);
              }
            }}
            type='button'
          >
            {bannerUploading ? (
              <div className='flex w-60 flex-col items-center gap-2'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                <span className='font-medium text-xs'>Đang tải ảnh bìa... {bannerPercent}%</span>
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                  <div
                    className='h-full bg-primary transition-all duration-150'
                    style={{ width: `${bannerPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <UploadCloud className='h-7 w-7 text-primary/80' />
                <span className='font-medium text-xs sm:text-sm'>{bannerLabel}</span>
                <span className='text-[11px] text-muted-foreground'>Hỗ trợ JPG, PNG, WebP (Tối đa 8MB)</span>
              </>
            )}
          </button>
        )}
        <input
          accept='image/*'
          className='hidden'
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              processBannerFile(file);
            }
          }}
          ref={bannerInputRef}
          type='file'
        />
      </div>

      {/* 2. UNIFIED DOCUMENT SHEET (TITLE + SUMMARY + META BAR + CONTENT) */}
      <div className='space-y-6 p-6 sm:p-8 lg:p-10'>
        {/* TITLE (Single-line visual H1, Enter disabled, Markdown formatting disabled) */}
        <div>
          <div className='mb-1.5 flex items-center justify-between'>
            <span className='font-mono text-[10px] text-muted-foreground uppercase tracking-wider'>Tiêu đề chính</span>
            {titleFallbackBadge && (
              <span className='rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-500'>
                {titleFallbackBadge}
              </span>
            )}
          </div>
          <textarea
            className='w-full resize-none overflow-hidden bg-transparent font-black text-2xl text-foreground leading-tight tracking-tight placeholder:text-muted-foreground/40 focus:outline-hidden sm:text-3xl lg:text-4xl'
            onChange={(e) => {
              const sanitized = e.target.value.replace(NEWLINE_REGEX, " ");
              onTitleChange(sanitized);
              autoResizeTextarea(e.currentTarget, 52);
            }}
            onFocus={() => {
              onActiveFieldChange("title");
              setBubbleState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                summaryRef.current?.focus();
              }
            }}
            placeholder={titlePlaceholder}
            ref={titleRef}
            required
            rows={1}
            value={title}
          />
        </div>

        {/* DESCRIPTION / SUMMARY (Supports Markdown formatting, optional) */}
        <div className='border-primary border-l-4 pl-4'>
          <div className='mb-1 flex items-center justify-between'>
            <span className='font-mono text-[10px] text-muted-foreground uppercase tracking-wider'>
              Mô tả ngắn / Tóm tắt (Hỗ trợ Markdown — Bỏ trống sẽ tự lấy đoạn đầu bài viết)
            </span>
            <div className='flex items-center gap-2'>
              {summaryFallbackBadge && (
                <span className='rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-500'>
                  {summaryFallbackBadge}
                </span>
              )}
              {editorMode === "preview-edit" && summary.trim() && (
                <button
                  className='flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-primary hover:bg-primary/10'
                  onClick={() => setEditingSummaryInPreview((prev) => !prev)}
                  type='button'
                >
                  {editingSummaryInPreview ? <Eye className='h-3 w-3' /> : <Pencil className='h-3 w-3' />}
                  <span>{editingSummaryInPreview ? "Xem kết quả" : "Sửa mô tả"}</span>
                </button>
              )}
            </div>
          </div>

          {editorMode === "preview-edit" && summary.trim() && !editingSummaryInPreview ? (
            <div className='group relative rounded-lg py-1 font-medium text-foreground/85 text-lg leading-relaxed transition-colors hover:bg-muted/30'>
              <button
                aria-label='Chỉnh sửa mô tả ngắn'
                className='absolute inset-0 z-10 cursor-text rounded-lg bg-transparent focus:outline-hidden focus:ring-2 focus:ring-primary/40'
                onClick={() => {
                  onActiveFieldChange("summary");
                  setEditingSummaryInPreview(true);
                  requestAnimationFrame(() => summaryRef.current?.focus());
                }}
                title='Nhấp để chỉnh sửa mô tả ngắn'
                type='button'
              />
              <MarkdownInline content={summary} />
            </div>
          ) : (
            <textarea
              className='w-full resize-none overflow-hidden bg-transparent font-medium text-base text-foreground/85 leading-relaxed placeholder:text-muted-foreground/45 focus:outline-hidden sm:text-lg'
              onBlur={() => {
                if (editorMode === "preview-edit" && summary.trim()) {
                  setTimeout(() => setEditingSummaryInPreview(false), 180);
                }
              }}
              onChange={(e) => {
                onSummaryChange(e.target.value);
                autoResizeTextarea(e.currentTarget, 56);
              }}
              onContextMenu={handleContextMenu("summary")}
              onFocus={() => onActiveFieldChange("summary")}
              onKeyUp={handleTextareaSelection}
              onMouseUp={handleMouseUpWithCoords}
              onPaste={handlePasteInEditor("summary")}
              placeholder={summaryPlaceholder}
              ref={summaryRef}
              rows={2}
              value={summary}
            />
          )}
        </div>

        {/* OPTIONAL INLINE DATE / META STRIP (like in user's sketch) */}
        {inlineMetaBar && <div className='border-border/60 border-y py-3'>{inlineMetaBar}</div>}

        {/* MAIN MARKDOWN CONTENT */}
        <div className='pt-2'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='font-mono text-[10px] text-muted-foreground uppercase tracking-wider'>
              Nội dung bài viết (
              {editorMode === "preview-edit"
                ? "Chế độ Trực quan - Nhấp vào từng khối để sửa"
                : "Chế độ Markdown Thuần - Raw Edit"}
              )
            </span>
            <span className='hidden text-[11px] text-muted-foreground sm:inline'>
              Mẹo: Bôi đen chữ để hiện thanh công cụ nổi, chuột phải để mở menu chèn nhanh, hoặc Ctrl+V để dán ảnh
            </span>
          </div>

          {editorMode === "preview-edit" ? (
            <VisualMarkdownBlocks
              activeTextareaRef={activeTextareaRef}
              onChange={onContentChange}
              onContextMenuOpen={handleContextMenu("content")}
              onFocusField={() => onActiveFieldChange("content")}
              onPasteImage={handlePasteInEditor("content")}
              onSelectChange={handleTextareaSelection}
              placeholder={contentPlaceholder}
              value={content}
            />
          ) : (
            <div className='space-y-4'>
              <textarea
                className='w-full resize-none overflow-hidden rounded-xl border border-border/60 bg-background/50 p-4 font-mono text-foreground text-sm leading-relaxed placeholder:text-muted-foreground/45 focus:border-primary/50 focus:outline-hidden'
                onChange={(e) => {
                  const savedY = window.scrollY;
                  onContentChange(e.target.value);
                  autoResizeTextarea(e.currentTarget, 460);
                  window.scrollTo({ top: savedY, behavior: "instant" as ScrollBehavior });
                }}
                onContextMenu={handleContextMenu("content")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const file = e.dataTransfer.files?.[0];
                  if (file?.type.startsWith("image/")) {
                    e.preventDefault();
                    const offset = e.currentTarget.selectionStart ?? e.currentTarget.value.length;
                    uploadAndInsertImageFile(file, { field: "content", offset });
                  }
                }}
                onFocus={(e) => {
                  activeTextareaRef.current = e.currentTarget;
                  onActiveFieldChange("content");
                }}
                onKeyUp={handleTextareaSelection}
                onMouseUp={handleMouseUpWithCoords}
                onPaste={handlePasteInEditor("content")}
                placeholder={contentPlaceholder}
                ref={contentRef}
                style={{ minHeight: "460px" }}
                value={content}
              />

              {content.trim() && (
                <details className='rounded-xl border border-border/60 bg-muted/15 p-4'>
                  <summary className='cursor-pointer font-medium text-muted-foreground text-xs hover:text-foreground'>
                    Xem nhanh kết quả render Markdown ngay bên dưới
                  </summary>
                  <div className='mt-4 border-t pt-4'>
                    <MarkdownBlock content={content} />
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
