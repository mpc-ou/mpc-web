"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  WebDesignBenefit,
  WebDesignConfig,
  WebDesignFaq,
  WebDesignMilestone,
  WebDesignPrize,
  WebDesignRegulation
} from "@/types/webdesign";
import { EditDialog } from "./edit-dialog";
import { Field, LocalizedInput, LocalizedTextarea, UploadUrlInput } from "./form-fields";
import type { ItemDialogProps } from "./list-panel";
import { EMPTY_TEXT, emptyBenefit, emptyFaq, emptyMilestone, emptyPrize, emptyRegulation } from "./webdesign-defaults";

const hasText = (t: { vi: string; en: string }) => !!(t.vi.trim() || t.en.trim());

export const PRIZE_TIER_LABELS: Record<WebDesignPrize["tier"], string> = {
  gold: "Vàng",
  silver: "Bạc",
  bronze: "Đồng"
};

export function MilestoneDialog({ item, onSubmit, onClose }: ItemDialogProps<WebDesignMilestone>) {
  const [draft, setDraft] = useState(item ?? emptyMilestone());
  const invalidRange = !!draft.end && !!draft.start && draft.end < draft.start;

  return (
    <EditDialog
      description='Hero sẽ đếm ngược tới mốc kế tiếp và hiện "Đang diễn ra" trong khoảng thời gian này.'
      onClose={onClose}
      onSubmit={() => onSubmit(draft)}
      submitDisabled={!(draft.start && hasText(draft.title)) || invalidRange}
      title={item ? "Sửa mốc thời gian" : "Thêm mốc thời gian"}
    >
      <Field label='Tên mốc'>
        <LocalizedInput
          onChange={(title) => setDraft({ ...draft, title })}
          placeholder='VD: Vòng loại'
          value={draft.title}
        />
      </Field>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field htmlFor='ms-start' label='Bắt đầu'>
          <Input
            id='ms-start'
            onChange={(e) => setDraft({ ...draft, start: e.target.value })}
            type='datetime-local'
            value={draft.start}
          />
        </Field>
        <Field
          hint={invalidRange ? "Phải sau thời điểm bắt đầu" : "Để trống = kéo dài cả ngày"}
          htmlFor='ms-end'
          label='Kết thúc'
        >
          <Input
            id='ms-end'
            onChange={(e) => setDraft({ ...draft, end: e.target.value })}
            type='datetime-local'
            value={draft.end}
          />
        </Field>
      </div>
      <Field label='Mô tả'>
        <LocalizedTextarea onChange={(description) => setDraft({ ...draft, description })} value={draft.description} />
      </Field>
    </EditDialog>
  );
}

export function RegulationDialog({ item, onSubmit, onClose }: ItemDialogProps<WebDesignRegulation>) {
  const [draft, setDraft] = useState(item ?? emptyRegulation());
  const setItem = (idx: number, next: WebDesignRegulation["items"][number]) =>
    setDraft({ ...draft, items: draft.items.map((it, i) => (i === idx ? next : it)) });

  return (
    <EditDialog
      onClose={onClose}
      onSubmit={() => onSubmit({ ...draft, items: draft.items.filter(hasText) })}
      size='lg'
      submitDisabled={!(hasText(draft.title) && draft.items.some(hasText))}
      title={item ? "Sửa điều khoản" : "Thêm điều khoản"}
    >
      <Field label='Tên điều khoản'>
        <LocalizedInput
          onChange={(title) => setDraft({ ...draft, title })}
          placeholder='VD: Công nghệ sử dụng'
          value={draft.title}
        />
      </Field>
      <Field hint='Mục để trống sẽ bị bỏ qua khi lưu.' label='Các mục'>
        <div className='flex flex-col gap-3'>
          {draft.items.map((text, idx) => (
            // Bullets have no id; position is their identity while editing.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above
            <div className='flex items-start gap-3 rounded-lg border border-border p-3' key={idx}>
              <span className='mt-2 w-5 shrink-0 font-mono text-muted-foreground text-xs'>{idx + 1}.</span>
              <div className='flex-1'>
                <LocalizedInput onChange={(next) => setItem(idx, next)} placeholder='Nội dung' value={text} />
              </div>
              <Button
                aria-label='Xóa mục'
                onClick={() => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== idx) })}
                size='icon'
                type='button'
                variant='ghost'
              >
                <Trash2 className='h-4 w-4 text-muted-foreground' />
              </Button>
            </div>
          ))}
          <Button
            className='w-fit'
            onClick={() => setDraft({ ...draft, items: [...draft.items, { ...EMPTY_TEXT }] })}
            size='sm'
            type='button'
            variant='outline'
          >
            <Plus className='mr-1.5 h-4 w-4' /> Thêm mục
          </Button>
        </div>
      </Field>
    </EditDialog>
  );
}

export function PrizeDialog({ item, onSubmit, onClose }: ItemDialogProps<WebDesignPrize>) {
  const [draft, setDraft] = useState(item ?? emptyPrize());

  return (
    <EditDialog
      description='Giải Vàng hiển thị dạng thẻ lớn nổi bật ngoài trang.'
      onClose={onClose}
      onSubmit={() => onSubmit(draft)}
      submitDisabled={!hasText(draft.title)}
      title={item ? "Sửa giải thưởng" : "Thêm giải thưởng"}
    >
      <Field htmlFor='prize-tier' label='Hạng'>
        <select
          className='h-9 rounded-md border border-border bg-background px-3 text-sm'
          id='prize-tier'
          onChange={(e) => setDraft({ ...draft, tier: e.target.value as WebDesignPrize["tier"] })}
          value={draft.tier}
        >
          {Object.entries(PRIZE_TIER_LABELS).map(([tier, label]) => (
            <option key={tier} value={tier}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label='Tên giải'>
        <LocalizedInput
          onChange={(title) => setDraft({ ...draft, title })}
          placeholder='VD: Giải nhất'
          value={draft.title}
        />
      </Field>
      <Field label='Mô tả'>
        <LocalizedTextarea
          onChange={(description) => setDraft({ ...draft, description })}
          placeholder='VD: Trị giá hơn 1.000.000 VNĐ…'
          value={draft.description}
        />
      </Field>
    </EditDialog>
  );
}

export function BenefitDialog({ item, onSubmit, onClose }: ItemDialogProps<WebDesignBenefit>) {
  const [draft, setDraft] = useState(item ?? emptyBenefit());

  return (
    <EditDialog
      onClose={onClose}
      onSubmit={() => onSubmit(draft)}
      submitDisabled={!hasText(draft.title)}
      title={item ? "Sửa quyền lợi" : "Thêm quyền lợi"}
    >
      <Field label='Tên quyền lợi'>
        <LocalizedInput onChange={(title) => setDraft({ ...draft, title })} value={draft.title} />
      </Field>
      <Field label='Mô tả'>
        <LocalizedTextarea onChange={(description) => setDraft({ ...draft, description })} value={draft.description} />
      </Field>
    </EditDialog>
  );
}

export function FaqDialog({ item, onSubmit, onClose }: ItemDialogProps<WebDesignFaq>) {
  const [draft, setDraft] = useState(item ?? emptyFaq());

  return (
    <EditDialog
      description='Bản tiếng Việt là bắt buộc; bản tiếng Anh để trống sẽ dùng lại bản tiếng Việt.'
      onClose={onClose}
      onSubmit={() => onSubmit(draft)}
      size='lg'
      submitDisabled={!(draft.question.vi.trim() && draft.answer.vi.trim())}
      title={item ? "Sửa câu hỏi" : "Thêm câu hỏi"}
    >
      <Field label='Câu hỏi'>
        <LocalizedInput onChange={(question) => setDraft({ ...draft, question })} value={draft.question} />
      </Field>
      <Field label='Câu trả lời'>
        <LocalizedTextarea onChange={(answer) => setDraft({ ...draft, answer })} value={draft.answer} />
      </Field>
      <label className='flex w-fit cursor-pointer items-center gap-2 text-sm'>
        <input
          checked={draft.isActive}
          className='h-4 w-4 accent-primary'
          onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
          type='checkbox'
        />
        Hiển thị ngoài trang
      </label>
    </EditDialog>
  );
}

type GeneralFields = Pick<
  WebDesignConfig,
  "contestDate" | "registerUrl" | "sponsorUrl" | "proposalUrl" | "rulesPdfUrl"
>;

export const GENERAL_FIELDS: Array<{
  key: keyof GeneralFields;
  label: string;
  hint: string;
  kind: "date" | "url" | "pdf";
}> = [
  { key: "contestDate", label: "Ngày thi", hint: "Dùng cho hero khi chưa có mốc thời gian nào.", kind: "date" },
  {
    key: "registerUrl",
    label: 'Nút "Đăng ký ngay"',
    hint: "Để trống: nút cuộn xuống mục đăng ký.",
    kind: "url"
  },
  { key: "sponsorUrl", label: 'Nút "Hợp tác tài trợ"', hint: "Để trống để ẩn nút.", kind: "url" },
  { key: "proposalUrl", label: 'Nút "Hồ sơ mời tài trợ"', hint: "Để trống: tự lấy proposal mới nhất.", kind: "url" },
  { key: "rulesPdfUrl", label: "Thể lệ đầy đủ (PDF)", hint: 'Để trống: hiện "sắp cập nhật".', kind: "pdf" }
];

export function GeneralDialog({
  value,
  onSubmit,
  onClose
}: {
  value: GeneralFields;
  onSubmit: (next: GeneralFields) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <EditDialog onClose={onClose} onSubmit={() => onSubmit(draft)} size='lg' title='Thông tin chung & liên kết'>
      {GENERAL_FIELDS.map((field) => (
        <Field hint={field.hint} htmlFor={`general-${field.key}`} key={field.key} label={field.label}>
          {field.kind === "pdf" ? (
            <UploadUrlInput
              accept='application/pdf'
              onChange={(url) => setDraft({ ...draft, [field.key]: url })}
              placeholder='https://… .pdf'
              value={draft[field.key]}
            />
          ) : (
            <Input
              id={`general-${field.key}`}
              onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
              placeholder={field.kind === "url" ? "https://…" : undefined}
              type={field.kind === "date" ? "datetime-local" : "url"}
              value={draft[field.key]}
            />
          )}
        </Field>
      ))}
    </EditDialog>
  );
}
