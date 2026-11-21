type Props = {
  eyebrow: string;
  title: string;
  aside?: React.ReactNode;
};

export function SectionHeading({ eyebrow, title, aside }: Props) {
  return (
    <div className='flex flex-wrap items-end justify-between gap-3'>
      <div className='flex flex-col gap-2'>
        <span className='font-medium font-mono text-muted-foreground text-xs tracking-[0.12em]'>{eyebrow}</span>
        <h2 className='font-black text-3xl tracking-tight sm:text-4xl'>{title}</h2>
      </div>
      {aside && <div className='font-medium font-mono text-muted-foreground text-xs'>{aside}</div>}
    </div>
  );
}
