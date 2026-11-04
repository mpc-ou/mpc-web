"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Code2,
  Eye,
  ImagePlus,
  Loader2,
  Palette,
  Redo2,
  Save,
  Sparkles,
  Table,
  Undo2
} from "lucide-react";
import { LanguageToggle, type ViewLanguage } from "@/components/custom/language-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDITOR_COLORS, type EditorFormatActions, FORMAT_BUTTONS } from "./editor-floating-menus";
import { TranslateButton } from "./translate-button";

export type EditorMode = "preview-edit" | "raw-edit";
export type ActiveField = "title" | "summary" | "content";

export type WorkspaceTopToolbarProps = {
  heading: string;
  subheading?: string;
  onBack?: () => void;
  backHref?: string;
  formId: string;
  saving: boolean;
  saveLabel: string;
  onOpenPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  viewLang: ViewLanguage;
  onViewLangChange: (lang: ViewLanguage) => void;
  sourceLanguage?: "VI" | "EN";
  onSourceLanguageChange?: (lang: "VI" | "EN") => void;
  translateFields?: { title?: string; summary?: string | null; content?: string };
  onTranslated?: (res: { title?: string; summary?: string; content?: string }) => void;
  activeField: ActiveField;
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  formatActions: EditorFormatActions;
  uploadingImage: boolean;
  uploadPercent: number | null;
  stickyTopClass?: string;
};

export function WorkspaceTopToolbar({
  heading,
  subheading,
  onBack,
  backHref,
  formId,
  saving,
  saveLabel,
  onOpenPreview,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  viewLang,
  onViewLangChange,
  sourceLanguage,
  onSourceLanguageChange,
  translateFields,
  onTranslated,
  activeField,
  editorMode,
  onEditorModeChange,
  formatActions,
  uploadingImage,
  uploadPercent,
  stickyTopClass = "sticky -top-4 md:-top-6 -mx-4 md:-mx-6 -mt-4 md:-mt-6 px-4 md:px-6 pt-3 pb-2.5"
}: WorkspaceTopToolbarProps) {
  const formattingDisabled = activeField === "title";
  const otherLang: ViewLanguage = viewLang === "vi" ? "en" : "vi";

  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`z-30 border-border border-b bg-card/95 shadow-sm backdrop-blur-md ${stickyTopClass}`}>
      {/* Top Row: Back + Title + Language/Translate + Preview Drawer + Save */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-border/60 border-b pb-3'>
        <div className='flex items-center gap-3'>
          {backHref ? (
            <a href={backHref}>
              <Button className='h-9 w-9 shrink-0' size='icon' type='button' variant='outline'>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </a>
          ) : (
            onBack && (
              <Button className='h-9 w-9 shrink-0' onClick={onBack} size='icon' type='button' variant='outline'>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            )
          )}
          <div>
            <h1 className='font-bold text-base text-foreground leading-tight sm:text-lg'>{heading}</h1>
            {subheading && <p className='hidden text-muted-foreground text-xs sm:block'>{subheading}</p>}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <LanguageToggle onChange={onViewLangChange} sourceLanguage={sourceLanguage} value={viewLang} />

          {sourceLanguage && onSourceLanguageChange && (
            <Select
              name='sourceLanguage'
              onValueChange={(v) => onSourceLanguageChange(v as "VI" | "EN")}
              value={sourceLanguage}
            >
              <SelectTrigger className='h-8 w-28 text-xs' title='Ngôn ngữ gốc'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='VI'>Gốc: 🇻🇳 VI</SelectItem>
                <SelectItem value='EN'>Gốc: 🇬🇧 EN</SelectItem>
              </SelectContent>
            </Select>
          )}

          {translateFields && onTranslated && (
            <TranslateButton
              disabled={!(translateFields.title || translateFields.content)}
              fields={translateFields}
              from={viewLang}
              label={viewLang === "vi" ? "Dịch → 🇬🇧" : "Dịch → 🇻🇳"}
              onTranslated={onTranslated}
              to={otherLang}
            />
          )}

          <Button
            className='h-9 gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/15'
            onClick={onOpenPreview}
            type='button'
            variant='outline'
          >
            <Eye className='h-4 w-4' />
            <span>Preview</span>
          </Button>

          <Button className='h-9' disabled={saving} form={formId} type='submit'>
            {saving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
            {saveLabel}
          </Button>
        </div>
      </div>

      {/* Second Row: Global Undo/Redo + Markdown Formatting Tools + Editor Mode Switcher */}
      <div className='mt-2.5 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-1'>
          {/* Global Workspace Undo / Redo */}
          <div className='flex items-center gap-0.5 rounded-lg border border-border/60 bg-background/70 p-0.5'>
            <button
              className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
              disabled={!canUndo}
              onClick={onUndo}
              onMouseDown={preventFocusLoss}
              title='Hoàn tác toàn bàn làm việc (Ctrl+Z)'
              type='button'
            >
              <Undo2 className='h-4 w-4' />
            </button>
            <button
              className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30'
              disabled={!canRedo}
              onClick={onRedo}
              onMouseDown={preventFocusLoss}
              title='Làm lại toàn bàn làm việc (Ctrl+Y)'
              type='button'
            >
              <Redo2 className='h-4 w-4' />
            </button>
          </div>

          <span className='mx-1 h-5 w-px bg-border' />

          {/* Formatting tools (disabled when Title is focused) */}
          <div
            className={`flex flex-wrap items-center gap-0.5 transition-opacity ${
              formattingDisabled ? "pointer-events-none opacity-35" : ""
            }`}
          >
            {FORMAT_BUTTONS.map((item) => (
              <button
                className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                disabled={formattingDisabled}
                key={item.title}
                onClick={() => formatActions.insertWrap(item.prefix, item.suffix)}
                onMouseDown={preventFocusLoss}
                title={item.title}
                type='button'
              >
                <item.icon className='h-3.5 w-3.5' />
              </button>
            ))}

            <span className='mx-1 h-4 w-px bg-border' />

            <button
              className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              disabled={formattingDisabled}
              onClick={() => formatActions.insertAlignment("left")}
              onMouseDown={preventFocusLoss}
              title='Căn trái'
              type='button'
            >
              <AlignLeft className='h-3.5 w-3.5' />
            </button>
            <button
              className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              disabled={formattingDisabled}
              onClick={() => formatActions.insertAlignment("center")}
              onMouseDown={preventFocusLoss}
              title='Căn giữa'
              type='button'
            >
              <AlignCenter className='h-3.5 w-3.5' />
            </button>
            <button
              className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              disabled={formattingDisabled}
              onClick={() => formatActions.insertAlignment("right")}
              onMouseDown={preventFocusLoss}
              title='Căn phải'
              type='button'
            >
              <AlignRight className='h-3.5 w-3.5' />
            </button>
            <button
              className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
              disabled={formattingDisabled}
              onClick={() => formatActions.insertAlignment("justify")}
              onMouseDown={preventFocusLoss}
              title='Căn đều'
              type='button'
            >
              <AlignJustify className='h-3.5 w-3.5' />
            </button>

            <span className='mx-1 h-4 w-px bg-border' />

            {/* Color Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className='cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  disabled={formattingDisabled}
                  onMouseDown={preventFocusLoss}
                  title='Màu chữ'
                  type='button'
                >
                  <Palette className='h-3.5 w-3.5' />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='grid w-48 grid-cols-4 gap-1.5 p-2'>
                {EDITOR_COLORS.map((c) => (
                  <DropdownMenuItem
                    className='flex cursor-pointer flex-col items-center justify-center rounded p-1.5'
                    key={c.name}
                    onClick={() => formatActions.insertColor(c.value)}
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

            {/* Insert Table */}
            <button
              className='flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground'
              disabled={formattingDisabled}
              onClick={() => formatActions.insertTable()}
              onMouseDown={preventFocusLoss}
              title='Chèn bảng Markdown'
              type='button'
            >
              <Table className='h-3.5 w-3.5' />
              <span className='hidden xl:inline'>Bảng</span>
            </button>

            {/* Upload Image into Content */}
            <button
              className='flex cursor-pointer items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 font-medium text-primary text-xs transition-colors hover:bg-primary/20 disabled:opacity-50'
              disabled={formattingDisabled || uploadingImage}
              onClick={() => formatActions.triggerImageUpload()}
              onMouseDown={preventFocusLoss}
              title='Tải ảnh vào đúng vị trí con trỏ (hoặc Ctrl+V để dán ảnh)'
              type='button'
            >
              {uploadingImage ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <ImagePlus className='h-3.5 w-3.5' />
              )}
              <span>
                {uploadingImage ? `Đang tải ${uploadPercent !== null ? `${uploadPercent}%` : "..."}` : "Chèn ảnh"}
              </span>
            </button>
          </div>
        </div>

        {/* Mode Switcher: Preview Edit vs Raw Edit */}
        <div className='flex items-center gap-2'>
          {activeField === "title" && (
            <span className='hidden rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-500 md:inline-block'>
              Tiêu đề: tắt định dạng & xuống dòng
            </span>
          )}
          <div className='flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs'>
            <button
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-colors ${
                editorMode === "preview-edit"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onEditorModeChange("preview-edit")}
              title='Chế độ trực quan cho người mới: vừa xem giao diện vừa nhấp vào từng khối để sửa'
              type='button'
            >
              <Sparkles className='h-3 w-3' />
              <span>Preview Edit</span>
            </button>
            <button
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-colors ${
                editorMode === "raw-edit"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => onEditorModeChange("raw-edit")}
              title='Chế độ soạn thảo mã Markdown thuần'
              type='button'
            >
              <Code2 className='h-3 w-3' />
              <span>Raw Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
