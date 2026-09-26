"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SIZES = {
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-6xl"
};

/**
 * Shared shell for every edit dialog: fixed header/footer, scrollable body.
 * Mount it only while open so the caller's `useState` draft re-initialises each time.
 */
export function EditDialog({
  title,
  description,
  onClose,
  onSubmit,
  submitLabel = "Xong",
  submitDisabled,
  size = "md",
  footerExtra,
  bodyClassName,
  children
}: {
  title: string;
  description?: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  size?: keyof typeof SIZES;
  footerExtra?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open>
      <DialogContent className={cn("flex max-h-[90vh] flex-col gap-0 p-0", SIZES[size])}>
        <DialogHeader className='border-border border-b px-6 py-4 text-left'>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className={cn("flex-1 space-y-5 overflow-y-auto px-6 py-5", bodyClassName)}>{children}</div>
        {(onSubmit || footerExtra) && (
          <DialogFooter className='items-center gap-2 border-border border-t px-6 py-3 sm:justify-between'>
            <div className='flex flex-wrap items-center gap-2'>{footerExtra}</div>
            {onSubmit && (
              <div className='flex gap-2'>
                <Button onClick={onClose} type='button' variant='outline'>
                  Hủy
                </Button>
                <Button disabled={submitDisabled} onClick={onSubmit} type='button'>
                  {submitLabel}
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
