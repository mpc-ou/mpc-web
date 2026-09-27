import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Mono tag shown above the title, rendered as `{index} - > {tag}`. */
  tag: string;
  index?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Extra content under the description on the right side (e.g. a "view all" link). */
  aside?: ReactNode;
  /**
   * `split`: title left, description right, divider underneath.
   * `stack`: everything stacked in one column (for side-by-side layouts).
   */
  layout?: "split" | "stack";
  className?: string;
};

export function SectionEyebrow({ index, tag, className }: { index?: string; tag: string; className?: string }) {
  return (
    <span className={cn("font-mono text-[13px] text-primary", className)}>
      {index ? `${index} - ` : ""}&gt; {tag}
    </span>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "font-black text-[clamp(2rem,4vw,3rem)] text-foreground leading-[1.05] tracking-[-0.03em]",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function SectionHeading({
  tag,
  index,
  title,
  description,
  aside,
  layout = "split",
  className
}: SectionHeadingProps) {
  if (layout === "stack") {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <SectionEyebrow index={index} tag={tag} />
        <SectionTitle>{title}</SectionTitle>
        {description && <p className='max-w-sm text-[15px] text-muted-foreground leading-relaxed'>{description}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn("mb-8 flex flex-wrap items-end justify-between gap-6 border-border/60 border-b pb-7", className)}
    >
      <div className='flex flex-col gap-3'>
        <SectionEyebrow index={index} tag={tag} />
        <SectionTitle>{title}</SectionTitle>
      </div>
      {(description || aside) && (
        <div className='flex max-w-sm flex-col items-end justify-end gap-4'>
          {description && <p className='text-[15px] text-muted-foreground leading-relaxed'>{description}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}
