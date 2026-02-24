"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export type ViewField = {
  label: string;
  value: ReactNode;
  colSpan?: 1 | 2;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: ViewField[];
  onEdit?: () => void;
  onDelete?: () => void;
};

export function AdminViewDialog({
  open,
  onOpenChange,
  title,
  data,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm md:grid-cols-2">
          {data.map((f) => (
            <div
              className={`flex flex-col gap-1.5 ${f.colSpan === 2 ? "md:col-span-2" : ""}`}
              key={f.label}
            >
              <span className="font-medium text-muted-foreground">
                {f.label}
              </span>
              <div className="rounded-md border bg-muted/30 p-3 text-foreground break-words w-full overflow-hidden">
                {f.value || (
                  <span className="text-muted-foreground italic">Trống</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Đóng
          </Button>
          {onEdit && (
            <Button onClick={onEdit} variant="default">
              Sửa thông tin
            </Button>
          )}
          {onDelete && (
            <Button onClick={onDelete} variant="destructive">
              Xóa
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
