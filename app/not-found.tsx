import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-[var(--text-primary)]">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
          Trang không tìm thấy
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>
    </div>
  );
}
