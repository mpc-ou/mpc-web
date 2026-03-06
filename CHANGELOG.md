# Changelog

Tất cả thay đổi đáng chú ý của dự án MPC Web được ghi nhận tại đây.
Format theo [Conventional Commits](https://www.conventionalcommits.org/).

---

## [2.0.0] — 2026-02-22

### ✨ Tính năng mới

#### Trang công khai
- **Trang chủ hoàn chỉnh** — Hero section, thống kê CLB (thành viên, sự kiện, năm hoạt động, dự án), giới thiệu, quyền lợi, ban chủ nhiệm, gallery ảnh, FAQ
- **Announcement bar** — Thông báo đầu trang với lên lịch, nút CTA, tùy chỉnh màu gradient, đóng/ẩn theo phiên
- **Hồ sơ thành viên công khai** — Trang cá nhân `/members/:slug` với avatar, bio, liên kết mạng xã hội, chức vụ CLB
- **Đa ngôn ngữ (i18n)** — Tiếng Việt (mặc định) & English, chuyển đổi trên header
- **Light / Dark mode** — Tự động theo hệ thống hoặc chuyển đổi thủ công
- **Swagger API Docs** — Tại `/api-docs`

#### Xác thực & hồ sơ
- **Google OAuth** — Đăng nhập qua Supabase Auth, tự động tạo/liên kết member record
- **Auth callback sync** — Tự động xử lý member pre-created bởi admin (pending authId → real authId)
- **Chỉnh sửa hồ sơ** — Thông tin cá nhân, avatar, ảnh bìa, liên kết mạng xã hội, slug tùy chỉnh
- **Slug validation** — Không trùng, không rỗng, không phải "me", chỉ chấp nhận `[a-z0-9_-]`

#### Admin Panel (12 modules)
- **Quản lý thành viên** — CRUD, tab hồ sơ / liên kết / chức vụ CLB, upload avatar & ảnh bìa, chỉnh sửa slug
- **Quản lý ban / phòng** — Cơ cấu tổ chức CLB
- **Quản lý bài viết** — Quy trình duyệt bài (Draft → Pending Review → Published / Rejected / Archived), lịch sử chỉnh sửa (PostRevision), tag, danh mục
- **Quản lý sự kiện** — Workshop, seminar, cuộc thi với trạng thái (Upcoming → Ongoing → Completed), ban tổ chức, gallery sự kiện, tag
- **Quản lý thành tựu** — Giải thưởng cá nhân / đội / CLB, highlight, liên kết thành viên với vai trò
- **Quản lý dự án** — Showcase với GitHub, website, video, tech stack, thành viên tham gia
- **Quản lý nhà tài trợ** — Đối tác & nhà tài trợ, phân hạng (Diamond / Gold / Silver / Bronze), theo sự kiện hoặc toàn CLB
- **Quản lý thông báo** — Announcement bar scheduling
- **Quản lý FAQ** — Hỗ trợ đa ngôn ngữ, sắp xếp thứ tự
- **Quản lý gallery** — Ảnh trang chủ
- **Quản lý homepage** — Tùy chỉnh hero image, intro, stats
- **Cài đặt site** — Key-value config (tên, mô tả, logo, …)

#### Database
- **20 Prisma models** — Member, Department, ClubRole, Post, PostRevision, Event, EventOrganizer, EventGallery, Achievement, AchievementMember, Project, ProjectMember, Sponsor, EventSponsorship, Category, Tag, PostTag, EventTag, SiteSetting, Announcement, HomepageSection, FaqItem, GalleryImage
- **Prisma pg adapter** — Kết nối PostgreSQL qua Supabase connection pooler
- **Caching** — `"use cache"` + `cacheTag` cho server actions, revalidateTag khi mutation

#### Infrastructure
- **Next.js 16** — App Router, React Compiler, standalone output
- **Docker** — Multi-stage Dockerfile, docker-compose
- **Biome 2 + Ultracite** — Lint & format, pre-commit hooks (Husky + lint-staged)
- **Commitlint** — Conventional Commits enforcement
- **Middleware** — i18n routing + Supabase session refresh + auth redirect

### 🐛 Sửa lỗi

- **Profile upsert email conflict** — Thay `prisma.member.upsert()` bằng `findFirst` (by authId OR email) + update/create, xử lý đúng member pre-created bởi admin
- **AbortError noise** — Error boundaries lọc `AbortError` (Next.js render cancellation), `Promise.allSettled` trong PageLayout & StatsSection tránh cascade abort
- **Admin slug editing** — Khôi phục trường slug trong admin member edit, validation server-side (unique, not "me", format check)
- **React Server Components CVE** — Patch lỗ hổng bảo mật RSC

---

## [1.6.1] — 2025-12-07

> Fork từ [holedev/nextjs-faster](https://github.com/holedev/nextjs-faster)

### 🐛 Sửa lỗi

- **ci:** Thêm plugin cho semantic release
- **ci:** Bỏ qua postinstall script trong GitHub Actions
