import Link from "next/link";
import { SITE, NAV_ITEMS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--nav-border)] bg-[var(--footer-bg)] text-[var(--footer-text)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--footer-text-hover)]">
              Về {SITE.fullName}
            </h3>
            <p className="text-sm">
              {SITE.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--footer-text-hover)]">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV_ITEMS.filter((item) => !("dropdown" in item)).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[var(--footer-text-hover)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--footer-text-hover)]">
              Liên hệ
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contact@mpc.club" className="hover:text-[var(--footer-text-hover)] transition-colors">
                  Email
                </a>
              </li>
              <li>
                <a href="https://github.com/oumpc" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--footer-text-hover)] transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--footer-text-hover)]">
              Thành viên
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/members" className="hover:text-[var(--footer-text-hover)] transition-colors">
                  Danh sách thành viên
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {SITE.fullName}. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
