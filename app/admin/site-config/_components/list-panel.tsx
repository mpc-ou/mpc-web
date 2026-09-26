"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { moveItem, upsertAt } from "./form-fields";

export type RowView = { leading?: ReactNode; title: ReactNode; meta?: ReactNode };

export type ItemDialogProps<T> = {
  /** `null` when creating a new item. */
  item: T | null;
  onSubmit: (item: T) => void;
  onClose: () => void;
};

type ListPanelProps<T> = {
  items: T[];
  onChange: (next: T[]) => void;
  getKey: (item: T, index: number) => string;
  renderRow: (item: T, index: number) => RowView;
  renderDialog: (props: ItemDialogProps<T>) => ReactNode;
  addLabel: string;
  description?: ReactNode;
  emptyText: string;
  /** Shown next to the empty text, e.g. "load samples". */
  emptyAction?: ReactNode;
  reorderable?: boolean;
  /** Extra content above the list (e.g. a related single setting). */
  header?: ReactNode;
};

/** Read-only list of rows; add/edit happen in a dialog, and changes go to the parent's draft. */
export function ListPanel<T>({
  items,
  onChange,
  getKey,
  renderRow,
  renderDialog,
  addLabel,
  description,
  emptyText,
  emptyAction,
  reorderable = false,
  header
}: ListPanelProps<T>) {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  // undefined = closed, null = creating, number = editing that index.
  const [editing, setEditing] = useState<number | null | undefined>(undefined);

  const handleDelete = async (index: number) => {
    const ok = await confirm({ title: "Xóa mục này?", description: "Thay đổi chỉ có hiệu lực sau khi nhấn Lưu." });
    if (ok) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className='flex flex-col gap-4'>
      <ConfirmDialog />
      {editing !== undefined &&
        renderDialog({
          item: editing === null ? null : (items[editing] ?? null),
          onClose: () => setEditing(undefined),
          onSubmit: (item) => {
            onChange(upsertAt(items, editing, item));
            setEditing(undefined);
          }
        })}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='text-muted-foreground text-sm'>{description}</div>
        <Button onClick={() => setEditing(null)} size='sm' type='button'>
          <Plus className='mr-1.5 h-4 w-4' /> {addLabel}
        </Button>
      </div>

      {header}

      {items.length === 0 ? (
        <div className='flex flex-col items-center gap-3 rounded-lg border border-border border-dashed px-6 py-10 text-center'>
          <p className='text-muted-foreground text-sm'>{emptyText}</p>
          {emptyAction}
        </div>
      ) : (
        <ul className='divide-y divide-border overflow-hidden rounded-lg border border-border'>
          {items.map((item, index) => {
            const row = renderRow(item, index);
            return (
              <li
                className='flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40'
                key={getKey(item, index)}
              >
                {row.leading && <div className='shrink-0'>{row.leading}</div>}
                <button
                  className='min-w-0 flex-1 cursor-pointer text-left'
                  onClick={() => setEditing(index)}
                  type='button'
                >
                  <div className='truncate font-medium text-sm'>{row.title}</div>
                  {row.meta && <div className='mt-0.5 truncate text-muted-foreground text-xs'>{row.meta}</div>}
                </button>
                <div className='flex shrink-0 items-center gap-0.5'>
                  {reorderable && (
                    <>
                      <Button
                        aria-label='Lên'
                        disabled={index === 0}
                        onClick={() => onChange(moveItem(items, index, index - 1))}
                        size='icon'
                        type='button'
                        variant='ghost'
                      >
                        <ArrowUp className='h-4 w-4' />
                      </Button>
                      <Button
                        aria-label='Xuống'
                        disabled={index === items.length - 1}
                        onClick={() => onChange(moveItem(items, index, index + 1))}
                        size='icon'
                        type='button'
                        variant='ghost'
                      >
                        <ArrowDown className='h-4 w-4' />
                      </Button>
                    </>
                  )}
                  <Button aria-label='Sửa' onClick={() => setEditing(index)} size='icon' type='button' variant='ghost'>
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    aria-label='Xóa'
                    onClick={() => handleDelete(index)}
                    size='icon'
                    type='button'
                    variant='ghost'
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
