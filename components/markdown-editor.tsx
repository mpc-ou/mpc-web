"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { marked } from "marked";
import { useCallback, useRef, useState } from "react";
import { sanitizeHtml } from "@/utils/sanitize-html";
import { uploadToStorage } from "@/utils/supabase-upload";

// Configure marked once for GFM
marked.setOptions({ gfm: true, breaks: true });

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: string;
  onChange?: (value: string) => void;
};

const toolbar = [
  { label: "B", prefix: "**", suffix: "**", title: "Bold" },
  { label: "I", prefix: "_", suffix: "_", title: "Italic" },
  { label: "H2", prefix: "## ", suffix: "", title: "Heading 2" },
  { label: "H3", prefix: "### ", suffix: "", title: "Heading 3" },
  { label: "🔗", prefix: "[", suffix: "](url)", title: "Link" },
  { label: "</>", prefix: "`", suffix: "`", title: "Code" },
  { label: "```", prefix: "```\n", suffix: "\n```", title: "Code block" },
  { label: "•", prefix: "- ", suffix: "", title: "List" },
  { label: "1.", prefix: "1. ", suffix: "", title: "Numbered list" },
  { label: "—", prefix: "\n---\n", suffix: "", title: "Divider" }
];

export const MarkdownEditor = ({
  name,
  defaultValue = "",
  placeholder = "Viết nội dung Markdown...",
  minHeight = "200px",
  onChange
}: MarkdownEditorProps) => {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (v: string) => {
      setValue(v);
      onChange?.(v);
    },
    [onChange]
  );

  const insertAtCursor = (text: string) => {
    const textarea = document.querySelector(`textarea[name="${name}"]`) as HTMLTextAreaElement;
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
    const textarea = document.querySelector(`textarea[name="${name}"]`) as HTMLTextAreaElement;
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = `${before}${prefix}${selected || "text"}${suffix}${after}`;
    handleChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + prefix.length + (selected || "text").length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      window.alert("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert("File quá lớn (tối đa 5MB)");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToStorage(file, "media", "editor");
      const altText = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      insertAtCursor(`\n![${altText}](${url})\n`);
    } catch (err) {
      window.alert(`Upload thất bại: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading(false);
      // Reset input so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className='flex flex-col overflow-hidden rounded-lg border border-border'>
      {/* Tab bar + Toolbar */}
      <div className='flex flex-wrap items-center gap-1 border-border border-b bg-muted/30 px-2 py-1.5'>
        <button
          className={`rounded px-2.5 py-1 font-medium text-xs transition-colors ${
            tab === "write" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("write")}
          type='button'
        >
          ✏️ Viết
        </button>
        <button
          className={`rounded px-2.5 py-1 font-medium text-xs transition-colors ${
            tab === "preview"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("preview")}
          type='button'
        >
          👁 Xem trước
        </button>

        {tab === "write" && (
          <>
            <span className='mx-1 h-4 w-px bg-border' />
            {toolbar.map((btn) => (
              <button
                className='rounded px-1.5 py-0.5 text-muted-foreground text-xs hover:bg-muted hover:text-foreground'
                key={btn.label}
                onClick={() => insertMarkdown(btn.prefix, btn.suffix)}
                title={btn.title}
                type='button'
              >
                {btn.label}
              </button>
            ))}
            <span className='mx-1 h-4 w-px bg-border' />
            {/* Image upload button */}
            <button
              className='inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground text-xs hover:bg-muted hover:text-foreground disabled:opacity-50'
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              title='Upload ảnh'
              type='button'
            >
              {uploading ? <Loader2 className='h-3 w-3 animate-spin' /> : <ImagePlus className='h-3 w-3' />}
              {uploading ? "Đang upload..." : "Ảnh"}
            </button>
            <input accept='image/*' className='hidden' onChange={handleImageUpload} ref={fileInputRef} type='file' />
          </>
        )}
      </div>

      {/* Content area */}
      {tab === "write" ? (
        <textarea
          className='w-full resize-y bg-background px-3 py-2 font-mono text-foreground text-sm focus:outline-none'
          name={name}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          value={value}
        />
      ) : (
        <div
          className='prose prose-sm dark:prose-invert max-w-none px-3 py-2'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via DOMPurify
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(simpleMarkdownToHtml(value)) || `<p class="text-muted-foreground">Chưa có nội dung</p>`
          }}
          style={{ minHeight }}
        />
      )}

      {/* Hidden input for form submission */}
      <input name={`${name}_hidden`} type='hidden' value={value} />
    </div>
  );
};

function simpleMarkdownToHtml(md: string): string {
  if (!md.trim()) {
    return "";
  }
  const result = marked.parse(md);
  return typeof result === "string" ? result : "";
}
