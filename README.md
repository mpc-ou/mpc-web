# CLB MPC Website

Website giới thiệu cho Câu lạc bộ Máy tính và Lập trình (MPC) được xây dựng với Next.js 16, Tailwind CSS 4, và Supabase.

## Tính năng

- ✅ Responsive design, thân thiện với mobile
- ✅ Light/Dark mode với hệ thống màu tùy chỉnh (white-label ready)
- ✅ Tích hợp Supabase cho authentication và data storage
- ✅ Hệ thống Custom Profile - Thành viên tự thiết kế trang profile
- ✅ SEO-friendly với metadata riêng cho từng trang
- ✅ Alert Banner cho thông báo quan trọng
- ✅ Hero Section với parallax effect (scroll + mouse + gyroscope)
- ✅ Image Gallery & Carousel với modal viewer
- ✅ FAQ Section với accordion
- ✅ Organization Section hiển thị Ban Chủ nhiệm và Cán sự
- ✅ Các trang: Trang chủ, Dự án, Sự kiện, Thành tựu, Về CLB
- ✅ Sẵn sàng cho i18n (đã setup cấu trúc)

## Yêu cầu hệ thống

- Node.js 18+ 
- npm hoặc yarn
- Tài khoản Supabase

## Cài đặt

1. Clone repository và cài đặt dependencies:

```bash
npm install
```

2. Tạo file `.env.local` và thêm các biến môi trường:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Chạy development server:

```bash
npm run dev
```

4. Mở [http://localhost:3000](http://localhost:3000) trong browser.

## Cấu trúc dự án

```
mpc-web/
├── app/                    # Next.js App Router
│   ├── (home)/            # Route groups
│   ├── projects/          # Trang các dự án
│   │   ├── page.tsx      # Server component (metadata)
│   │   └── page-client.tsx # Client component
│   ├── events/            # Trang sự kiện
│   │   ├── [slug]/       # Chi tiết sự kiện
│   │   ├── page.tsx
│   │   └── page-client.tsx
│   ├── achievements/      # Trang thành tựu
│   ├── about/             # Trang về CLB
│   ├── members/           # Danh sách thành viên
│   ├── profile/           # Profile thành viên
│   │   ├── [studentId]/  # Profile động
│   │   │   └── page.tsx  # Auto-load custom profile
│   │   └── custom/       # Custom profiles
│   │       ├── example-profile.tsx # Template mẫu
│   │       └── {studentId}.tsx    # Custom profiles
│   └── login/             # Trang đăng nhập
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Header component
│   ├── footer.tsx        # Footer component
│   ├── hero-section.tsx  # Hero section với parallax
│   ├── alert-banner.tsx  # Alert banner
│   └── theme-provider.tsx # Theme provider
├── docs/                  # Documentation
│   └── CUSTOM_PROFILE.md # Hướng dẫn custom profile
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   ├── i18n/             # i18n config (sẵn sàng)
│   ├── config.ts         # Configuration
│   ├── constants.ts      # Constants & content
│   └── utils.ts          # Utility functions
└── public/                # Static files
```

## Supabase Setup

### Database Schema

Cần tạo các bảng sau trong Supabase:

#### Members Table

```sql
CREATE TABLE members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'Thành viên',
  avatar_url TEXT,
  bio TEXT,
  has_custom_profile BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### Events Table

```sql
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  date DATE,
  location TEXT,
  participants_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

#### Articles Table

```sql
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

## Custom Profile System

Thành viên có thể tự thiết kế trang profile của mình một cách linh hoạt và sáng tạo.

### Cách sử dụng:

1. Copy file mẫu từ `app/profile/custom/example-profile.tsx`
2. Đổi tên thành `{studentId}.tsx` và đặt vào `app/profile/custom/`
3. Tùy chỉnh component theo ý muốn
4. Component sẽ tự động được load khi truy cập `/profile/{student_id}`

### Tài liệu chi tiết:

Xem file `docs/CUSTOM_PROFILE.md` để biết:
- Hướng dẫn chi tiết cách tạo custom profile
- Danh sách đầy đủ các tham số có sẵn
- Ví dụ mẫu và best practices
- Troubleshooting các vấn đề thường gặp

## Hệ thống màu

Website sử dụng hệ thống CSS variables cho white-label support. Tất cả màu được định nghĩa trong `app/globals.css` và có thể dễ dàng tùy chỉnh.

### Các biến màu chính:

- `--primary`: Màu chủ đạo
- `--secondary`: Màu phụ
- `--accent`: Màu nhấn
- `--background`: Màu nền
- `--foreground`: Màu chữ
- Và nhiều biến khác...

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

## Công nghệ sử dụng

- **Next.js 16**: React framework với App Router
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **Supabase**: Backend as a Service (Auth + Database)
- **TypeScript**: Type safety
- **Lucide React**: Icons

## License

MIT

## Contributing

Mọi đóng góp đều được chào đón!