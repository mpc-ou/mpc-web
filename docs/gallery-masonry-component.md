# Gallery Masonry Component

## Tổng quan

Gallery Masonry là một bộ gồm 2 component chính (`GallerySection` + `GalleryMasonry`) dùng để hiển thị bộ sưu tập ảnh dạng **masonry cuộn vô tận** với hiệu ứng parallax tự động kết hợp lightbox xem ảnh phóng to.

---

## Kiến trúc

```
GallerySection (Server Component)
├── ScrollReveal (hiệu ứng scroll animation)
├── GalleryMasonry (Client Component)
│   ├── Masonry Columns (tự động tạo DOM)
│   ├── requestAnimationFrame loop (auto-scroll)
│   ├── Wheel event listener (cuộn chuột)
│   └── ImageLightbox (phóng to ảnh)
```

---

## 1. `GallerySection` — Server Component

**Đường dẫn**: `app/[locale]/(main)/_components/gallery-section.tsx`

### Chức năng
- Fetch danh sách ảnh từ server action `getGalleryImages`
- Render heading, subtitle với i18n (namespace `home.gallery`)
- Bọc `GalleryMasonry` trong `ScrollReveal` để tạo hiệu ứng xuất hiện khi scroll

### Props
| Prop | Type | Description |
|------|------|-------------|
| `locale` | `string` | Locale hiện tại để load translation |

### Behavior
- **Empty state**: Nếu `images.length === 0`, return `null` (không render gì)
- Sử dụng `next-intl` server-side translation

---

## 2. `GalleryMasonry` — Client Component

**Đường dẫn**: `app/[locale]/(main)/_components/gallery-masonry.client.tsx`

### Props
| Prop | Type | Description |
|------|------|-------------|
| `images` | `GalleryImage[]` | Mảng các object ảnh |
| `className?` | `string` | Class Tailwind tùy chỉnh |

### Type `GalleryImage`
```typescript
type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};
```

### Tính năng chính

#### a) Masonry Layout tự động
- Số cột thay đổi theo viewport:
  - `< 640px` → **2 cột**
  - `640px – 1280px` → **3 cột**
  - `>= 1280px` → **4 cột**
- Khoảng cách giữa các cột: `GAP = 10px`
- Chiều cao mỗi card được tính bằng **hash từ id** ảnh (dùng `hashHeight()`) để đảm bảo ảnh luôn có cùng kích thước trên mọi lần render
- 5 kiểu card kích thước có sẵn (w × h): `640×480`, `640×800`, `640×640`, `640×360`, `480×640`

#### b) Auto-scroll (cuộn tự động)
- Mỗi cột có tốc độ cuộn riêng (`COL_SPEEDS`):
  - `[0.55, 0.42, 0.5, 0.46]`
- Sử dụng `requestAnimationFrame` loop để animate
- Khi offset vượt quá ngưỡng, sẽ **wrap-around** về đầu để tạo hiệu ứng cuộn vô tận

#### c) Scroll bằng chuột (Wheel)
- Người dùng có thể cuộn bằng chuột để tăng/tốc giảm offset các cột
- Hệ số `deltaY * 0.6` để kiểm soát độ nhạy
- Khi cuộn bằng chuột, auto-scroll tạm dừng trong **150ms** (`lastWheelRef`)

#### d) Pause on Hover
- Hover chuột vào gallery → `isPausedRef = true` → auto-scroll dừng
- Rời chuột → `isPausedRef = false` → auto-scroll tiếp tục

#### e) Hover effect trên card
- Mỗi card có hiệu ứng:
  - **Scale (phóng to)**: `scale(1.06)` khi hover
  - **Caption overlay**: Gradient đen từ dưới lên, opacity chuyển từ `0 → 1` khi hover

#### f) Gradient fade (top & bottom)
- Hai lớp gradient ở trên và dưới cùng gallery:
  - Top: `bg-linear-to-b from-background to-transparent`
  - Bottom: `bg-linear-to-t from-background to-transparent`
- Tạo hiệu ứng mờ dần ở hai đầu, làm gallery trông mượt mà hơn

#### g) Lightbox (phóng to ảnh)
- Click vào card → mở `ImageLightbox` với ảnh tương ứng
- Sử dụng `findIndex` để mapping từ ảnh trong masonry columns → index chính xác trong mảng `images`

### Resize Handling
- Theo dõi sự kiện `resize` trên window
- Chỉ rebuild masonry khi **số cột thay đổi** (tránh rebuild không cần thiết)

### Cleanup
- `cancelAnimationFrame` khi component unmount
- `removeEventListener` cho wheel và resize

---

## 3. `ImageLightbox` — Client Component

**Đường dẫn**: `components/image-lightbox.client.tsx`

### Props
| Prop | Type | Description |
|------|------|-------------|
| `images` | `ImageItem[]` | Mảng ảnh |
| `initialIndex` | `number` (default: 0) | Index ảnh đầu tiên |
| `open` | `boolean` | Trạng thái mở/đóng |
| `onClose` | `() => void` | Callback đóng lightbox |

### Tính năng
- **Keyboard navigation**: `ArrowLeft` / `ArrowRight` để chuyển ảnh, `Escape` để đóng
- **Prev / Next buttons**: Hai nút chevron trái/phải (chỉ hiện khi có > 1 ảnh)
- **Close button**: Nút X ở góc trên phải
- **Click backdrop**: Click vào vùng đen bên ngoài ảnh để đóng
- **Title & Caption**: Hiển thị bên dưới ảnh với border và backdrop-blur
- **Counter**: `1 / 5` ở dưới cùng
- **Portal**: Render qua `createPortal` vào `document.body`
- **Body scroll lock**: `document.body.style.overflow = "hidden"` khi mở
- **Chỉ mount ở client**: Dùng `mounted` state để tránh hydration mismatch

---

## Luồng dữ liệu

```
getGalleryImages()           ← Server Action
       │
       ▼
GallerySection              ← Server Component (fetch data)
       │
       ▼
GalleryMasonry              ← Client Component (nhận images prop)
       │
       ├── buildCols()      ← Tạo masonry DOM
       ├── animate()        ← Auto-scroll loop (rAF)
       ├── onWheel()        ← Cuộn chuột
       └── setLightboxOpen  ← Mở lightbox
              │
              ▼
       ImageLightbox         ← Portal component (xem phóng to)
```

---

## Cấu hình & Hằng số

| Hằng | Giá trị | Mô tả |
|------|---------|-------|
| `GAP` | `10` | Khoảng cách giữa các card |
| `COL_SPEEDS` | `[0.55, 0.42, 0.5, 0.46]` | Tốc độ auto-scroll mỗi cột |
| `CARD_SIZES` | 5 kích thước | Tỉ lệ ảnh ngẫu nhiên từ hash |

---

## Lưu ý

- `GalleryMasonry` là **Client Component** (có `"use client"`) vì sử dụng DOM manipulation trực tiếp, `requestAnimationFrame`, và event listeners
- `GallerySection` là **Server Component** — fetch data và render markup tối thiểu
- Empty state được xử lý ở cả server component (`images.length === 0` → return null)
- Component này dùng DOM API trực tiếp (`document.createElement`, `style.cssText`) thay vì React state để tối ưu performance cho số lượng lớn ảnh
