"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Code2,
  Eye,
  ImagePlus,
  Loader2,
  Palette,
  Redo2,
  Sparkles,
  Table,
  Undo2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyAlignmentToTextarea,
  applyColorToTextarea,
  applyWrapToTextarea,
  type ContextMenuState,
  EDITOR_COLORS,
  EditorContextMenu,
  EditorSelectionBubble,
  executeInlineImageUploadTask,
  FORMAT_BUTTONS,
  restoreTextareaCursorWithoutScrollJump,
  type SelectionBubbleState
} from "@/components/forms/editor-floating-menus";
import { VisualMarkdownBlocks } from "@/components/forms/visual-markdown-blocks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { MarkdownBlock } from "./markdown-block";

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: string;
  onChange?: (value: string) => void;
};

export const MarkdownEditor = ({
  name,
  defaultValue = "",
  placeholder = "Viết nội dung Markdown...",
  minHeight = "350px",
  onChange
}: MarkdownEditorProps) => {
  const { toast } = useToast();
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"preview-edit" | "raw-edit" | "preview">("raw-edit");
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const activeBlockTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const savedInsertOffsetRef = useRef<number>(defaultValue.length);

  // Floating selection bubble & right-click context menu
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

  // Undo/Redo State History
  const historyRef = useRef<string[]>([defaultValue]);
  const historyIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  useEffect(() => {
    if (defaultValue !== latestValueRef.current) {
      setValue(defaultValue);
      latestValueRef.current = defaultValue;
    }
  }, [defaultValue]);

  const handleChange = useCallback(
    (v: string, pushHistory = true) => {
      setValue(v);
      latestValueRef.current = v;
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
      latestValueRef.current = prevValue;
      onChange?.(prevValue);
      updateHistoryState();
    }
  }, [onChange, updateHistoryState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextValue = historyRef.current[historyIndexRef.current];
      setValue(nextValue);
      latestValueRef.current = nextValue;
      onChange?.(nextValue);
      updateHistoryState();
    }
  }, [onChange, updateHistoryState]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
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

  const getActiveTextarea = useCallback((): HTMLTextAreaElement | null => {
    return mode === "preview-edit" ? activeBlockTextareaRef.current : textareaRef.current;
  }, [mode]);

  const insertWrap = useCallback(
    (prefix: string, suffix: string, fallbackText = "văn bản") => {
      const textarea = getActiveTextarea();
      const currentVal = latestValueRef.current;
      const savedWindowY = typeof window !== "undefined" ? window.scrollY : 0;
      const savedScrollTop = textarea?.scrollTop ?? 0;

      if (!textarea) {
        handleChange(`${currentVal}${prefix}${fallbackText}${suffix}`);
        return;
      }

      const { nextValue, nextCursorStart, nextCursorEnd } = applyWrapToTextarea(
        textarea,
        currentVal,
        prefix,
        suffix,
        fallbackText
      );
      handleChange(nextValue);
      restoreTextareaCursorWithoutScrollJump(textarea, nextCursorStart, nextCursorEnd, savedWindowY, savedScrollTop);
    },
    [getActiveTextarea, handleChange]
  );

  const insertAlignment = useCallback(
    (align: "left" | "center" | "right" | "justify") => {
      const textarea = getActiveTextarea();
      const currentVal = latestValueRef.current;
      const savedWindowY = typeof window !== "undefined" ? window.scrollY : 0;
      const savedScrollTop = textarea?.scrollTop ?? 0;

      if (!textarea) {
        handleChange(`${currentVal}\n<div style="text-align: ${align}">\n\nNội dung\n\n</div>\n`);
        return;
      }

      const { nextValue, nextCursorPos } = applyAlignmentToTextarea(textarea, currentVal, align);
      handleChange(nextValue);
      restoreTextareaCursorWithoutScrollJump(textarea, nextCursorPos, nextCursorPos, savedWindowY, savedScrollTop);
    },
    [getActiveTextarea, handleChange]
  );

  const insertColor = useCallback(
    (color: string) => {
      const textarea = getActiveTextarea();
      const currentVal = latestValueRef.current;
      const savedWindowY = typeof window !== "undefined" ? window.scrollY : 0;
      const savedScrollTop = textarea?.scrollTop ?? 0;

      if (!textarea) {
        return;
      }

      const { nextValue, nextCursorPos } = applyColorToTextarea(textarea, currentVal, color);
      handleChange(nextValue);
      restoreTextareaCursorWithoutScrollJump(textarea, nextCursorPos, nextCursorPos, savedWindowY, savedScrollTop);
    },
    [getActiveTextarea, handleChange]
  );

  const insertTable = useCallback(() => {
    const tableMarkdown =
      "\n| Cột 1 | Cột 2 | Cột 3 |\n| ----- | ----- | ----- |\n| A     | B     | C     |\n| D     | E     | F     |\n";
    insertWrap(tableMarkdown, "", "");
  }, [insertWrap]);

  const uploadFileAndInsertAtOffset = useCallback(
    async (file: File, explicitOffset?: number) => {
      const insertOffset = explicitOffset ?? savedInsertOffsetRef.current;
      await executeInlineImageUploadTask({
        file,
        insertOffset,
        getCurrentValue: () => latestValueRef.current,
        setFieldValue: (nextVal, pushHist = true) => handleChange(nextVal, pushHist),
        onStart: () => {
          setUploading(true);
          setUploadPercent(1);
        },
        onProgress: (pct) => setUploadPercent(pct),
        onFinish: () => {
          setUploading(false);
          setUploadPercent(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: (msg) => toast({ variant: "destructive", description: msg })
      });
    },
    [handleChange, toast]
  );

  const triggerImageUpload = useCallback(() => {
    const ta = getActiveTextarea();
    savedInsertOffsetRef.current = ta
      ? (ta.selectionStart ?? latestValueRef.current.length)
      : latestValueRef.current.length;
    fileInputRef.current?.click();
  }, [getActiveTextarea]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileAndInsertAtOffset(file);
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) {
        return;
      }
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const pos = e.currentTarget.selectionStart ?? e.currentTarget.value.length;
            uploadFileAndInsertAtOffset(file, pos);
            return;
          }
        }
      }
    },
    [uploadFileAndInsertAtOffset]
  );

  const handleSelection = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (end - start > 0) {
      const rect = el.getBoundingClientRect();
      setBubbleState({
        visible: true,
        x: rect.left + Math.min(rect.width / 2, 220),
        y: Math.max(80, rect.top + 8)
      });
    } else {
      setBubbleState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    savedInsertOffsetRef.current = e.currentTarget.selectionStart ?? e.currentTarget.value.length;
    setBubbleState((prev) => (prev.visible ? { ...prev, visible: false } : prev));
    setContextMenuState({
      visible: true,
      x: e.clientX,
      y: e.clientY
    });
  }, []);

  const formatActions = {
    insertWrap,
    insertAlignment,
    insertColor,
    insertTable,
    triggerImageUpload
  };

  return (
    <div className='relative flex flex-col overflow-hidden rounded-xl border border-border bg-card'>
      <EditorSelectionBubble
        actions={formatActions}
        onClose={() => setBubbleState((prev) => ({ ...prev, visible: false }))}
        state={bubbleState}
      />

      <EditorContextMenu
        actions={formatActions}
        onClose={() => setContextMenuState((prev) => ({ ...prev, visible: false }))}
        state={contextMenuState}
      />

      {/* Mode bar + Toolbar */}
      <div className='flex flex-wrap items-center gap-1.5 border-border border-b bg-muted/40 px-3 py-2'>
        <div className='flex items-center rounded-md border border-border bg-background p-0.5 shadow-2xs'>
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 font-medium text-xs transition-colors ${
              mode === "preview-edit" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("preview-edit")}
            type='button'
          >
            <Sparkles className='h-3 w-3' />
            Preview Edit
          </button>
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 font-medium text-xs transition-colors ${
              mode === "raw-edit" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("raw-edit")}
            type='button'
          >
            <Code2 className='h-3 w-3' />
            Raw Edit
          </button>
          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 font-medium text-xs transition-colors ${
              mode === "preview" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("preview")}
            type='button'
          >
            <Eye className='h-3 w-3' />
            Xem trước
          </button>
        </div>

        {mode !== "preview" && (
          <>
            <span className='h-5 w-px bg-border' />

            {/* Undo/Redo Group */}
            <div className='flex items-center gap-0.5'>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
                disabled={!canUndo}
                onClick={handleUndo}
                onMouseDown={(e) => e.preventDefault()}
                title='Hoàn tác (Ctrl+Z)'
                type='button'
              >
                <Undo2 className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
                disabled={!canRedo}
                onClick={handleRedo}
                onMouseDown={(e) => e.preventDefault()}
                title='Làm lại (Ctrl+Y)'
                type='button'
              >
                <Redo2 className='h-3.5 w-3.5' />
              </button>
            </div>

            <span className='h-5 w-px bg-border' />

            {/* Formats Group */}
            <div className='flex flex-wrap items-center gap-0.5'>
              {FORMAT_BUTTONS.map((item) => (
                <button
                  className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  key={item.title}
                  onClick={() => insertWrap(item.prefix, item.suffix)}
                  onMouseDown={(e) => e.preventDefault()}
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
                onMouseDown={(e) => e.preventDefault()}
                title='Căn trái'
                type='button'
              >
                <AlignLeft className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                onClick={() => insertAlignment("center")}
                onMouseDown={(e) => e.preventDefault()}
                title='Căn giữa'
                type='button'
              >
                <AlignCenter className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                onClick={() => insertAlignment("right")}
                onMouseDown={(e) => e.preventDefault()}
                title='Căn phải'
                type='button'
              >
                <AlignRight className='h-3.5 w-3.5' />
              </button>
              <button
                className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                onClick={() => insertAlignment("justify")}
                onMouseDown={(e) => e.preventDefault()}
                title='Căn đều'
                type='button'
              >
                <AlignJustify className='h-3.5 w-3.5' />
              </button>
            </div>

            <span className='h-5 w-px bg-border' />

            {/* Extra Features Group */}
            <div className='flex items-center gap-1'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    onMouseDown={(e) => e.preventDefault()}
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
                  {EDITOR_COLORS.map((c) => (
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

              <button
                className='flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground'
                onClick={insertTable}
                onMouseDown={(e) => e.preventDefault()}
                title='Chèn bảng'
                type='button'
              >
                <Table className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>Bảng</span>
              </button>

              <button
                className='flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50'
                disabled={uploading}
                onClick={triggerImageUpload}
                onMouseDown={(e) => e.preventDefault()}
                title='Upload ảnh (hoặc Ctrl+V để dán ảnh)'
                type='button'
              >
                {uploading ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <ImagePlus className='h-3.5 w-3.5' />}
                <span>{uploading ? `Đang tải ${uploadPercent ?? 0}%` : "Ảnh"}</span>
              </button>
              <input accept='image/*' className='hidden' onChange={handleImageUpload} ref={fileInputRef} type='file' />
            </div>
          </>
        )}
      </div>

      {/* Content area */}
      {mode === "raw-edit" && (
        <textarea
          className='w-full resize-y bg-background px-4 py-3 font-mono text-foreground text-sm leading-relaxed focus:outline-hidden'
          name={name}
          onChange={(e) => handleChange(e.target.value)}
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
          onKeyUp={handleSelection}
          onMouseUp={handleSelection}
          onPaste={handlePaste}
          placeholder={placeholder}
          ref={textareaRef}
          style={{ minHeight }}
          value={value}
        />
      )}

      {mode === "preview-edit" && (
        <div className='bg-background p-4' style={{ minHeight }}>
          <VisualMarkdownBlocks
            activeTextareaRef={activeBlockTextareaRef}
            onChange={(nextVal) => handleChange(nextVal)}
            onContextMenuOpen={handleContextMenu}
            onFocusField={() => undefined}
            onPasteImage={handlePaste}
            onSelectChange={handleSelection}
            placeholder={placeholder}
            value={value}
          />
        </div>
      )}

      {mode === "preview" && (
        <div className='overflow-y-auto bg-background px-4 py-3' style={{ minHeight }}>
          {value.trim() ? (
            <MarkdownBlock content={value} />
          ) : (
            <p className='text-muted-foreground text-sm italic'>Chưa có nội dung xem trước</p>
          )}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {mode !== "raw-edit" && <input name={name} type='hidden' value={value} />}
      <input name={`${name}_hidden`} type='hidden' value={value} />
    </div>
  );
};
