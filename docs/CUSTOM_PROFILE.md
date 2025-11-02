# Hướng dẫn tạo Custom Profile

Hệ thống Custom Profile cho phép mỗi thành viên tự thiết kế trang profile cá nhân của mình một cách linh hoạt và sáng tạo.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Cách tạo Custom Profile](#cách-tạo-custom-profile)
- [Các tham số có sẵn](#các-tham-số-có-sẵn)
- [Ví dụ mẫu](#ví-dụ-mẫu)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Tổng quan

Khi một thành viên truy cập `/profile/{studentId}`, hệ thống sẽ:

1. **Kiểm tra custom profile**: Tìm file `app/profile/custom/{studentId}.tsx`
2. **Nếu có**: Render custom profile component
3. **Nếu không**: Render profile mặc định

## 🚀 Cách tạo Custom Profile

### Bước 1: Tạo file custom profile

1. Copy file mẫu từ `app/profile/custom/example-profile.tsx`
2. Đổi tên thành `{studentId}.tsx` (ví dụ: `20210001.tsx`)
3. Đặt file vào folder `app/profile/custom/`

```bash
# Ví dụ: Tạo custom profile cho studentId = 20210001
cp app/profile/custom/example-profile.tsx app/profile/custom/20210001.tsx
```

### Bước 2: Cập nhật thông tin trong component

Sửa đổi component để phản ánh thông tin và style của bạn:

```tsx
export default function CustomProfile20210001({ profile }: CustomProfileProps) {
  return (
    <div>
      {/* Your custom design here */}
    </div>
  );
}
```

### Bước 3: (Tùy chọn) Cập nhật database

Để đánh dấu rằng bạn có custom profile:

```sql
UPDATE members 
SET has_custom_profile = true 
WHERE student_id = '20210001';
```

## 📦 Các tham số có sẵn

Component custom profile nhận prop `profile` với các tham số sau:

### Thông tin cơ bản

```typescript
interface ProfileData {
  // Các trường bắt buộc
  id: string;                    // Mã số sinh viên (student_id)
  name: string;                  // Tên thành viên
  email: string;                 // Email
  role: string;                  // Vai trò: "Chủ nhiệm" | "Phó Chủ nhiệm" | "Cán sự" | "Thành viên"
  avatar: string | null;         // URL ảnh đại diện
  bio: string | null;            // Giới thiệu ngắn
  
  // Thông tin database
  student_id: string;            // Mã số sinh viên (giống id)
  created_at?: string;          // Ngày tạo tài khoản
  updated_at?: string;          // Ngày cập nhật cuối
  
  // Các trường tùy chọn (có thể thêm vào database)
  social?: {
    github?: string;
    facebook?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
  
  skills?: string[];             // Danh sách kỹ năng
  interests?: string[];          // Danh sách sở thích
  
  // Bất kỳ field nào khác từ database sẽ được pass qua
  [key: string]: any;
}
```

### Cách sử dụng

```tsx
export default function MyCustomProfile({ profile }: CustomProfileProps) {
  return (
    <div>
      <h1>{profile.name}</h1>
      <p>Mã số: {profile.id}</p>
      <p>Vai trò: {profile.role}</p>
      {profile.avatar && <img src={profile.avatar} alt={profile.name} />}
      {profile.bio && <p>{profile.bio}</p>}
      
      {/* Social links */}
      {profile.social?.github && (
        <a href={profile.social.github}>GitHub</a>
      )}
      
      {/* Skills */}
      {profile.skills?.map(skill => (
        <span key={skill}>{skill}</span>
      ))}
    </div>
  );
}
```

## 🎨 Ví dụ mẫu

File `example-profile.tsx` chứa một ví dụ hoàn chỉnh với:

- ✅ Layout responsive (mobile-friendly)
- ✅ Hero section với avatar và social links
- ✅ Cards cho About, Skills, Interests
- ✅ Sidebar với contact info và stats
- ✅ Sử dụng shadcn/ui components
- ✅ Theming với CSS variables

### Các components có sẵn

Bạn có thể sử dụng tất cả components từ `@/components/ui/`:

- `Button`, `Card`, `Badge`, `Input`, `Label`, etc.
- Xem thêm: `components/ui/`

### Icons

Sử dụng Lucide React icons:

```tsx
import { Github, Mail, Facebook, Linkedin, Code, Award } from "lucide-react";

<Github className="h-5 w-5" />
```

## 💡 Best Practices

### 1. Responsive Design

Luôn đảm bảo profile hiển thị tốt trên mọi thiết bị:

```tsx
<div className="container mx-auto px-4 py-12">
  <div className="max-w-6xl mx-auto">
    {/* Content */}
  </div>
</div>
```

### 2. Sử dụng CSS Variables

Dùng CSS variables để tự động adapt với theme:

```tsx
// ✅ Good
<div className="bg-[var(--card)] text-[var(--text-primary)]">

// ❌ Bad
<div className="bg-white text-black">
```

### 3. Xử lý null/undefined

Luôn check null trước khi render:

```tsx
// ✅ Good
{profile.avatar && <img src={profile.avatar} />}

// ✅ Better
{profile.avatar ? (
  <img src={profile.avatar} alt={profile.name} />
) : (
  <DefaultAvatar />
)}
```

### 4. Performance

- Sử dụng Next.js `Image` component cho images
- Lazy load heavy components nếu cần
- Tránh quá nhiều re-renders

```tsx
import Image from "next/image";

<Image
  src={profile.avatar}
  alt={profile.name}
  width={128}
  height={128}
  className="rounded-full"
/>
```

### 5. Accessibility

- Thêm alt text cho images
- Sử dụng semantic HTML
- Đảm bảo contrast đủ
- Keyboard navigation

## 🐛 Troubleshooting

### Custom profile không hiển thị?

**Vấn đề**: File không được tìm thấy

**Giải pháp**:
1. Kiểm tra tên file: Phải đúng `{studentId}.tsx` (ví dụ: `20210001.tsx`)
2. Kiểm tra location: Phải ở `app/profile/custom/`
3. Kiểm tra export: Component phải export default
4. Kiểm tra tên function: Có thể đặt bất kỳ tên nào, nhưng phải export default

### Type errors?

**Vấn đề**: TypeScript không nhận diện `ProfileData`

**Giải pháp**: Import type từ example file hoặc define lại:

```tsx
interface ProfileData {
  id: string;
  name: string;
  // ... (xem section "Các tham số có sẵn")
}
```

### Build errors?

**Vấn đề**: Dynamic import không hoạt động

**Giải pháp**: 
- Đảm bảo file tồn tại trước khi build
- Hoặc sử dụng try-catch trong import

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

## 💬 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra file `example-profile.tsx` để tham khảo
2. Xem lại documentation trên
3. Liên hệ Ban Cán sự CLB để được hỗ trợ

---

**Lưu ý**: Custom profile phải tuân thủ các quy định của CLB về nội dung và hình ảnh phù hợp.

