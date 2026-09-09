import type { LucideIcon } from "lucide-react";

type AdminPageHeaderProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({ icon: Icon, title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
          <Icon className='h-5 w-5 text-primary' />
        </div>
        <div>
          <h1 className='font-bold text-2xl text-foreground leading-tight'>{title}</h1>
          {description && <p className='text-muted-foreground text-sm'>{description}</p>}
        </div>
      </div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
}
