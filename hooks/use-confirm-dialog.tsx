"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
};

/**
 * Hook trả về:
 * - `confirm(options?)` — Promise<boolean>, resolve true khi user bấm xác nhận
 * - `ConfirmDialog` — component cần render một lần trong JSX
 *
 * @example
 * const { confirm, ConfirmDialog } = useConfirmDialog();
 * const ok = await confirm({ title: "Xóa?", description: "Không thể hoàn tác." });
 * if (ok) { ... }
 * // Trong JSX:
 * return <><ConfirmDialog />...</>
 */
const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolveRef.current?.(false);
  };

  const ConfirmDialog = () => (
    <Dialog
      onOpenChange={(v) => {
        if (!v) {
          handleCancel();
        }
      }}
      open={open}
    >
      <DialogContent className='sm:max-w-100'>
        <DialogHeader>
          <DialogTitle>{options.title ?? "Xác nhận"}</DialogTitle>
          {options.description && <DialogDescription>{options.description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <Button onClick={handleCancel} type='button' variant='outline'>
            {options.cancelText ?? "Hủy"}
          </Button>
          <Button onClick={handleConfirm} type='button' variant={options.variant ?? "destructive"}>
            {options.confirmText ?? "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, ConfirmDialog };
};

export { useConfirmDialog };
