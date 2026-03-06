# MPC Web — Mobile Programming Club

Website quản lý và giới thiệu **Câu lạc bộ Lập trình Di động (MPC)** — Khoa Công nghệ Thông tin, Trường Đại học Mở TP.HCM.

## 🛠️ Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-1-3FCF8E?logo=supabase)
![pnpm](https://img.shields.io/badge/pnpm-1-F69220?logo=pnpm)


---

## ✨ Tính năng

### 🌐 Trang công khai

- **Trang chủ** — Hero banner, thống kê CLB, giới thiệu, quyền lợi thành viên, ban chủ nhiệm, gallery ảnh, FAQ
- **Hồ sơ thành viên** — Trang cá nhân với slug tùy chỉnh (`/members/:slug`)
- **Đa ngôn ngữ** — Tiếng Việt (mặc định) & English qua `next-intl`
- **Light / Dark mode** — Chuyển đổi giao diện với `next-themes`
- **API Docs** — Swagger UI tự động tại `/api-docs`

### 🔐 Khu vực thành viên

- **Đăng nhập Google OAuth** qua Supabase Auth
- **Chỉnh sửa hồ sơ** — Thông tin cá nhân, avatar, ảnh bìa, liên kết mạng xã hội, slug

### ⚙️ Quản trị (Admin Panel)

| Module | Mô tả |
|---|---|
| **Thành viên** | CRUD, quản lý vai trò CLB, chức vụ theo kỳ, mạng xã hội, slug |
| **Ban / Phòng** | Quản lý cơ cấu tổ chức CLB |
| **Bài viết** | Quy trình duyệt bài (Draft → Review → Published), lịch sử chỉnh sửa |
| **Sự kiện** | Quản lý workshop, seminar, cuộc thi với đăng ký, gallery |
| **Thành tựu** | Giải thưởng cá nhân, đội, CLB |
| **Dự án** | Showcase dự án với GitHub, tech stack, thành viên |
| **Nhà tài trợ** | Quản lý đối tác, phân hạng tài trợ |
| **Thông báo** | Thanh announcement bar với lịch trình, CTA, tuỳ chỉnh màu |
| **FAQ** | Câu hỏi thường gặp, hỗ trợ đa ngôn ngữ |
| **Gallery** | Quản lý ảnh trang chủ |
| **Homepage** | Tùy chỉnh nội dung hero, intro, stats |
| **Cài đặt** | Cấu hình site (tên, mô tả, logo, …) |

---

## 🛠 Công nghệ

| Lớp | Công nghệ |
|---|---|
| **Framework** | Next.js 16 (App Router, React Compiler, Turbopack) |
| **UI** | Tailwind CSS 4, Shadcn UI, Radix Primitives, Lucide Icons |
| **Database** | PostgreSQL (Supabase) + Prisma ORM 7 (pg adapter) |
| **Auth** | Supabase Auth (Google OAuth) |
| **Storage** | Supabase Storage (avatar, cover, gallery) |
| **i18n** | next-intl (vi, en) |
| **Data Table** | TanStack Table v8 |
| **API Docs** | next-swagger-doc + swagger-ui-react |
| **Lint & Format** | Biome 2 + Ultracite, Husky, lint-staged, commitlint |
| **Deploy** | Docker / Standalone build |

---

## 🚀 Bắt đầu

### Yêu cầu

- Node.js ≥ 24
- pnpm ≥ 10
- PostgreSQL (hoặc Supabase project)

### Cài đặt

```bash
git clone https://github.com/konnn04/mpc-web.git
cd mpc-web

# Kích hoạt đúng phiên bản pnpm
corepack enable pnpm

# Cấu hình biến môi trường
cp .env.example .env
# → Điền SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL, DIRECT_URL

# Cài dependencies
pnpm i

# Chạy migration & seed database
pnpm dlx prisma migrate dev

# Khởi động dev server (Turbopack)
pnpm dev
```

### Biến môi trường

| Biến | Mô tả |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL API (mặc định: `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `DATABASE_URL` | Connection pooler (port 6543) |
| `DIRECT_URL` | Direct connection (port 5432) |
| `ADMIN_ACCOUNT` | Email(s) root admin, JSON array |

---

## 🐳 Deploy với Docker

```bash
docker compose up -d
```

Container chạy trên port `3000`, standalone build, non-root user.

---

## 📁 Cấu trúc dự án

```
app/
├── [locale]/                  # Routes đa ngôn ngữ (vi, en)
│   ├── (main)/                # Trang chủ & các section
│   │   └── members/[slug]/    # Hồ sơ thành viên
│   ├── (private)/             # Yêu cầu đăng nhập
│   │   ├── (main)/profile/    # Chỉnh sửa hồ sơ cá nhân
│   │   └── admin/             # Admin panel (12 modules)
│   └── (public)/auth/         # Trang đăng nhập
├── api/                       # API routes
│   ├── auth/callback/         # OAuth callback
│   └── docs/                  # Swagger JSON spec
└── api-docs/                  # Swagger UI
components/
├── custom/                    # Components dự án (Header, Footer, Layout, …)
└── ui/                        # Shadcn UI components
configs/
├── prisma/                    # Schema & migrations (20 models)
├── i18n/                      # Cấu hình next-intl
├── messages/                  # File dịch (en.json, vi.json)
├── supabase/                  # Client, server, middleware helpers
└── swagger/                   # Swagger config
```

---

## 📋 Scripts

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Dev server với Turbopack |
| `pnpm build` | Build production |
| `pnpm start` | Chạy production server |
| `pnpm lint:check` | Kiểm tra linting (Biome) |
| `pnpm lint:fix` | Tự động sửa lint |

---

## 🤝 Đóng góp

1. Fork repo
2. Tạo branch: `git checkout -b feat/ten-tinh-nang`
3. Commit theo [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, …
4. Push & tạo Pull Request

---

## 📝 License

MIT License

## 👥 Team

Phát triển bởi **MPC — Mobile Programming Club**, Trường ĐH Mở TP.HCM.
