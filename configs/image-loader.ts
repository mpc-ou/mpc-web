import type { ImageLoaderProps } from "next/image";

const BYPASS_HOSTS = ["api.dicebear.com", "image.thum.io", "placehold.co", ".googleusercontent.com"];

const shouldBypass = (src: string) => {
  if (src.startsWith("data:") || src.startsWith("blob:") || src.split("?")[0]?.endsWith(".svg")) {
    return true;
  }
  if (!src.startsWith("http")) {
    return false;
  }
  const { hostname } = new URL(src);
  return BYPASS_HOSTS.some((h) => (h.startsWith(".") ? hostname.endsWith(h) : hostname === h));
};

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (shouldBypass(src)) {
    return src;
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
