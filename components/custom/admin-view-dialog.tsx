"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

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
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {data.map((f, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1.5 ${f.colSpan === 2 ? "md:col-span-2" : ""}`}
            >
              <span className="text-muted-foreground font-medium">
                {f.label}
              </span>
              <div className="text-foreground bg-muted/30 p-3 rounded-md border">
                {f.value || (
                  <span className="text-muted-foreground italic">Trống</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {onEdit && (
            <Button variant="default" onClick={onEdit}>
              Sửa thông tin
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              Xóa
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
