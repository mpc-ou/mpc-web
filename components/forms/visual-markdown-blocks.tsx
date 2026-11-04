"use client";

import { Check, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MarkdownBlock } from "@/components/markdown-block";
import { Button } from "@/components/ui/button";

export function splitMarkdownIntoBlocks(markdown: string): string[] {
  if (!markdown.trim()) {
    return [""];
  }
  const lines = markdown.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let inCodeFence = false;
  let inHtmlAlignDiv = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      current.push(line);
      continue;
    }
    if (trimmed.startsWith('<div style="text-align:')) {
      inHtmlAlignDiv = true;
      current.push(line);
      continue;
    }
    if (inHtmlAlignDiv && trimmed === "</div>") {
      inHtmlAlignDiv = false;
      current.push(line);
      blocks.push(current.join("\n"));
      current = [];
      continue;
    }

    if (inCodeFence || inHtmlAlignDiv) {
      current.push(line);
      continue;
    }

    if (trimmed === "") {
      if (current.length > 0) {
        blocks.push(current.join("\n"));
        current = [];
      }
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    blocks.push(current.join("\n"));
  }

  return blocks.length > 0 ? blocks : [""];
}

export function joinMarkdownBlocks(blocks: string[]): string {
  return blocks
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
    .join("\n\n");
}

type VisualMarkdownBlocksProps = {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  activeTextareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  onSelectChange: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onContextMenuOpen: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  onPasteImage: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onFocusField: () => void;
};

export function VisualMarkdownBlocks({
  value,
  onChange,
  placeholder = "Nhấp vào đây để bắt đầu viết nội dung...",
  activeTextareaRef,
  onSelectChange,
  onContextMenuOpen,
  onPasteImage,
  onFocusField
}: VisualMarkdownBlocksProps) {
  const [blocks, setBlocks] = useState<string[]>(() => splitMarkdownIntoBlocks(value));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const blockTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync external value changes (e.g. Undo/Redo, Language switch, Toolbar formatting)
  useEffect(() => {
    setBlocks((prevBlocks) => {
      const joinedCurrent = joinMarkdownBlocks(prevBlocks);
      if (value.trim() !== joinedCurrent.trim()) {
        return splitMarkdownIntoBlocks(value);
      }
      return prevBlocks;
    });
  }, [value]);

  // Auto-resize active block textarea
  useEffect(() => {
    const el = blockTextareaRef.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.max(76, el.scrollHeight)}px`;
  });

  const updateBlock = (index: number, nextBlockText: string) => {
    const nextBlocks = [...blocks];
    nextBlocks[index] = nextBlockText;
    setBlocks(nextBlocks);
    onChange(joinMarkdownBlocks(nextBlocks));
  };

  const insertBlockAfter = (index: number) => {
    const nextBlocks = [...blocks];
    nextBlocks.splice(index + 1, 0, "");
    setBlocks(nextBlocks);
    setEditingIndex(index + 1);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) {
      updateBlock(0, "");
      setEditingIndex(0);
      return;
    }
    const nextBlocks = blocks.filter((_, idx) => idx !== index);
    setBlocks(nextBlocks);
    setEditingIndex(null);
    onChange(joinMarkdownBlocks(nextBlocks));
  };

  return (
    <div className='space-y-3'>
      {blocks.map((block, idx) => {
        const isEditing = editingIndex === idx || (blocks.length === 1 && !block.trim());

        if (isEditing) {
          return (
            <div
              className='group relative rounded-xl border border-primary/40 bg-muted/20 p-3 shadow-xs transition-all'
              key={`block-edit-${idx.toString()}`}
            >
              <div className='mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground'>
                <span className='flex items-center gap-1.5 font-mono text-primary'>
                  <Pencil className='h-3 w-3' />
                  Đang sửa khối #{idx + 1} (hỗ trợ bôi đen & chuột phải)
                </span>
                <div className='flex items-center gap-1'>
                  <Button
                    className='h-6 gap-1 px-2 text-[11px]'
                    onClick={() => insertBlockAfter(idx)}
                    size='sm'
                    type='button'
                    variant='ghost'
                  >
                    <Plus className='h-3 w-3' />
                    Thêm đoạn dưới
                  </Button>
                  {blocks.length > 1 && (
                    <Button
                      className='h-6 px-1.5 text-destructive hover:text-destructive'
                      onClick={() => removeBlock(idx)}
                      size='sm'
                      title='Xóa khối này'
                      type='button'
                      variant='ghost'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  )}
                  {block.trim() && (
                    <Button
                      className='h-6 gap-1 px-2 text-[11px]'
                      onClick={() => setEditingIndex(null)}
                      size='sm'
                      type='button'
                      variant='secondary'
                    >
                      <Check className='h-3 w-3' />
                      Xong
                    </Button>
                  )}
                </div>
              </div>

              <textarea
                className='w-full resize-none overflow-hidden bg-transparent font-mono text-foreground text-sm leading-relaxed focus:outline-hidden'
                onChange={(e) => {
                  const savedY = window.scrollY;
                  updateBlock(idx, e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.max(76, e.target.scrollHeight)}px`;
                  window.scrollTo({ top: savedY, behavior: "instant" as ScrollBehavior });
                }}
                onContextMenu={onContextMenuOpen}
                onFocus={(e) => {
                  activeTextareaRef.current = e.currentTarget;
                  onFocusField();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && block.trim()) {
                    setEditingIndex(null);
                  }
                }}
                onKeyUp={onSelectChange}
                onMouseUp={onSelectChange}
                onPaste={onPasteImage}
                placeholder={idx === 0 ? placeholder : "Nhập nội dung Markdown cho đoạn này..."}
                ref={(el) => {
                  blockTextareaRef.current = el;
                  if (el) {
                    activeTextareaRef.current = el;
                  }
                }}
                rows={3}
                value={block}
              />

              {block.trim() && (
                <div className='mt-2 border-border/60 border-t pt-2.5'>
                  <div className='mb-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider'>
                    <Eye className='h-2.5 w-2.5' />
                    Hiển thị trực tiếp:
                  </div>
                  <div className='rounded-lg bg-background/60 px-3 py-2'>
                    <MarkdownBlock content={block} />
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          // biome-ignore lint/a11y/useSemanticElements: div container wraps interactive MarkdownBlock images and links while allowing click-to-edit on text
          <div
            className='group relative cursor-text rounded-xl border border-transparent px-3 py-2 transition-all hover:border-border/80 hover:bg-muted/20 focus:outline-hidden focus:ring-2 focus:ring-primary/40'
            key={`block-view-${idx.toString()}`}
            onClick={(e) => {
              const target = e.target as HTMLElement | null;
              // Allow clicking images (to zoom in Lightbox), buttons, or links without entering edit mode
              if (target?.closest("img, .fb-image-collage, button, a, [role='dialog']")) {
                return;
              }
              onFocusField();
              setEditingIndex(idx);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onFocusField();
                setEditingIndex(idx);
              }
            }}
            role='button'
            tabIndex={0}
          >
            <button
              className='absolute top-2 right-2 z-20 hidden items-center gap-1 rounded-md border bg-background/95 px-2 py-1 text-[10px] text-muted-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-primary group-hover:flex'
              onClick={(e) => {
                e.stopPropagation();
                onFocusField();
                setEditingIndex(idx);
              }}
              title='Nhấp để chỉnh sửa đoạn này'
              type='button'
            >
              <Pencil className='h-2.5 w-2.5 text-primary' />
              <span>Sửa đoạn này</span>
            </button>
            <MarkdownBlock content={block} />
          </div>
        );
      })}

      <div className='pt-1'>
        <Button
          className='w-full border-dashed text-muted-foreground text-xs hover:text-foreground'
          onClick={() => insertBlockAfter(blocks.length - 1)}
          size='sm'
          type='button'
          variant='outline'
        >
          <Plus className='mr-1.5 h-3.5 w-3.5' />
          Thêm đoạn nội dung mới
        </Button>
      </div>
    </div>
  );
}
