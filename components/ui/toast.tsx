"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[400px] flex-col gap-2 p-0",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg",
    "transition-all duration-300 ease-in-out",
    "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full data-[state=open]:fade-in-0",
    "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full data-[state=closed]:fade-out-80",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-border/50 bg-background/95 text-foreground backdrop-blur-sm",
        destructive:
          "destructive border-red-500/30 bg-red-950/90 text-red-50 backdrop-blur-sm",
        success:
          "border-emerald-500/30 bg-emerald-950/90 text-emerald-50 backdrop-blur-sm",
        warning:
          "border-amber-500/30 bg-amber-950/90 text-amber-50 backdrop-blur-sm",
        info: "border-blue-500/30 bg-blue-950/90 text-blue-50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const toastIconMap = {
  default: null,
  destructive: <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />,
  success: (
    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
  ),
  warning: <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />,
  info: <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />,
} as const;

const progressBarColors = {
  default: "bg-foreground/30",
  destructive: "bg-red-400/60",
  success: "bg-emerald-400/60",
  warning: "bg-amber-400/60",
  info: "bg-blue-400/60",
} as const;

/** Progress bar đếm ngược 5s */
const ToastProgress = ({
  variant = "default",
  duration = 5000,
}: {
  variant?: keyof typeof progressBarColors;
  duration?: number;
}) => {
  const [width, setWidth] = React.useState(100);

  React.useEffect(() => {
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(remaining);
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div className="absolute right-0 bottom-0 left-0 h-[3px] overflow-hidden rounded-b-xl bg-white/10">
      <div
        className={cn("h-full transition-none", progressBarColors[variant])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
  const v: ToastVariant = variant ?? "default";
  const icon = toastIconMap[v] ?? null;

  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      ref={ref}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex flex-1 flex-col gap-0.5">{children}</div>
      <ToastProgress variant={v} />
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    className={cn(
      "mt-1 inline-flex h-7 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium transition-colors",
      "hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    className={cn(
      "shrink-0 rounded-md p-1 opacity-0 transition-opacity",
      "hover:opacity-100 focus:opacity-100 focus:outline-none",
      "group-hover:opacity-60 hover:!opacity-100",
      "text-foreground/50 hover:text-foreground",
      className,
    )}
    ref={ref}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    className={cn("font-semibold text-sm leading-tight", className)}
    ref={ref}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    className={cn("text-sm opacity-80 leading-snug", className)}
    ref={ref}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
