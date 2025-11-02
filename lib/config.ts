/**
 * Configuration - Các cấu hình có thể thay đổi của website
 * Bao gồm: bật/tắt hiệu ứng, độ nhạy, theme mặc định, animation settings
 */

// ==================== THEME ====================
export const THEME_CONFIG = {
  defaultTheme: "system" as "light" | "dark" | "system",
  storageKey: "mpc-theme",
} as const;

// ==================== HEADER ====================
export const HEADER_CONFIG = {
  scrollThreshold: 200, // px - độ scroll để hiển thị background
  logoSize: {
    width: 32,
    height: 32,
  },
} as const;

// ==================== HERO SECTION ====================
export const HERO_CONFIG = {
  // Parallax effect settings
  parallax: {
    enabled: true, // Bật/tắt parallax effect
    scrollMax: 50, // % - độ dịch chuyển tối đa khi scroll
    mouseMax: 3, // % - độ dịch chuyển khi di chuột/gyro
    mouseRange: [-0.5, 0.5] as [number, number],
    scaleRange: [1.15, 1.35] as [number, number], // Image scale để zoom tỉ lệ
    opacityFadePoint: 0.5,
  },
  // Spring animation settings
  spring: {
    mouse: {
      stiffness: 150,
      damping: 15,
    },
    device: {
      stiffness: 100,
      damping: 20,
    },
  },
  // Animation timings
  animation: {
    titleDelay: 0.8,
    subtitleDelay: 0.2,
    initialY: 20,
  },
} as const;

// ==================== IMAGE CAROUSEL ====================
export const CAROUSEL_CONFIG = {
  autoPlay: false,
  autoPlayInterval: 5000, // ms
  aspectRatio: {
    mobile: "16/10",
    desktop: "16/9",
  },
} as const;

// ==================== IMAGE GALLERY MODAL ====================
export const GALLERY_CONFIG = {
  zoom: {
    min: 0.5,
    max: 3,
    step: 0.25,
  },
  animation: {
    staggerDelay: 0.1,
    initialScale: 0.9,
    hoverScale: 1.1,
  },
} as const;

// ==================== SCROLL TO TOP ====================
export const SCROLL_TO_TOP_CONFIG = {
  threshold: 300, // px - scroll threshold để hiển thị button
  position: {
    bottom: 8, // Tailwind units
    right: 8,
  },
} as const;

// ==================== ANIMATIONS ====================
export const ANIMATION_CONFIG = {
  // Framer motion defaults
  framer: {
    initialY: 20,
    duration: 0.8,
    ease: "easeOut" as const,
  },
  // Viewport settings
  viewport: {
    once: true,
    margin: "0px",
  },
} as const;

// ==================== SECTION SPACING ====================
export const SPACING_CONFIG = {
  section: {
    default: 20, // py-20
    small: 12, // py-12
    large: 24, // py-24
  },
} as const;

// ==================== CONTENT LIMITS ====================
export const CONTENT_CONFIG = {
  // Số lượng items hiển thị
  featuredArticles: 3,
  galleryImages: 8,
  officersCount: 6,
  faqItems: 3,
} as const;

// ==================== LAYOUT GRID ====================
export const LAYOUT_CONFIG = {
  articles: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    gap: 6,
  },
  projects: {
    columns: 2,
    gap: 6,
  },
  events: {
    columns: 2,
    gap: 6,
  },
  achievements: {
    presidents: {
      columns: 3,
      gap: 6,
    },
    collective: {
      columns: 2,
      gap: 6,
    },
    individual: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      gap: 6,
    },
  },
  members: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    gap: 6,
  },
  organization: {
    cards: {
      columns: 2,
      gap: 8,
    },
    officers: {
      columns: 3,
      gap: 4,
    },
  },
  gallery: {
    mobile: 2,
    desktop: 4,
    gap: 4,
  },
} as const;

// ==================== ALERT BANNER ====================
export const ALERT_CONFIG = {
  enabled: true, // Bật/tắt alert banner
  id: "main-alert", // ID để lưu vào localStorage
  type: "info" as "info" | "success" | "warning" | "error" | null, // Loại alert
  content: "🎉 CLB MPC đang tuyển thành viên mới! Đăng ký ngay để không bỏ lỡ cơ hội phát triển kỹ năng lập trình.",
  link: {
    label: "Đăng ký ngay",
    url: "/members",
    openInNewTab: false,
  },
} as const;

