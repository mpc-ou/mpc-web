import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  name: string;
  initials: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
};

export function HonoreeAvatar({ src, name, initials, sizes, className, imageClassName }: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {src ? (
        <Image
          alt={name}
          className={cn("object-cover text-transparent", imageClassName)}
          fill
          sizes={sizes}
          src={src}
          unoptimized={src.includes("googleusercontent.com")}
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/25 via-amber-400/15 to-transparent font-black text-primary'>
          {initials}
        </div>
      )}
    </div>
  );
}

export const initialsOf = (firstName: string, lastName: string) =>
  `${lastName.trim()[0] ?? ""}${firstName.trim()[0] ?? ""}`.toUpperCase();
