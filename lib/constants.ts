/**
 * Constants - Các giá trị cố định của website
 * Bao gồm: tên page, mô tả, tiêu đề, nội dung sections, navigation items
 */

// ==================== SITE INFO ====================
export const SITE = {
  name: "MPC",
  fullName: "CLB Lập trình trên thiết bị di động",
  tagline: "Ở đâu có bug, ở đó có MPC!",
  description: "Câu lạc bộ Lập trình trên thiết bị di động - Nơi học hỏi, phát triển và chia sẻ kiến thức về công nghệ",
  logo: {
    src: "/logo.png",
    alt: "CLB MPC Logo",
  },
} as const;

// ==================== META TAGS ====================
export const META = {
  title: `${SITE.fullName} - ${SITE.name}`,
  description: SITE.description,
  defaultTitle: `${SITE.name} - ${SITE.fullName}`,
} as const;

// ==================== NAVIGATION ====================
export type NavItem = 
  | { label: string; href: string }
  | { label: string; href: string; dropdown: Array<{ label: string; href: string }> };

export const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Các dự án", href: "/projects" },
  {
    label: "Sự kiện",
    href: "/events",
    dropdown: [
      { label: "Giới thiệu chung", href: "/events" },
      { label: "Web Design", href: "/events/webdesign" },
      { label: "Robocode", href: "/events/robocode" },
    ],
  },
  { label: "Thành tựu", href: "/achievements" },
  { label: "Về CLB", href: "/about" },
];

// ==================== PAGE TITLES & DESCRIPTIONS ====================
export const PAGES = {
  home: {
    title: SITE.fullName,
    subtitle: SITE.tagline,
    description: "Nơi học hỏi, phát triển và chia sẻ kiến thức về công nghệ",
    heroImage: "/images/hero-images/index.jpg",
    iframeYoutube:"https://www.youtube.com/embed/4ypQgAmOXaE",
    iframeGoogleMap:null,
    iframeDescription:"Video ngắn giới thiệu về CLB MPC"
  },
  projects: {
    title: "Các dự án của CLB",
    subtitle: "Khám phá các chuyên ngành và dự án mà CLB đang phát triển",
    description: "Khám phá các chuyên ngành và dự án mà CLB đang phát triển",
    heroImage: "/images/hero-images/projects.jpg",
  },
  events: {
    title: "Sự kiện CLB",
    subtitle: "Các sự kiện và hoạt động mà CLB tổ chức và tham gia",
    description: "Các sự kiện và hoạt động mà CLB tổ chức và tham gia",
    heroImage: "/images/hero-images/events.jpg",
  },
  achievements: {
    title: "Thành tựu CLB",
    subtitle: "Các thành tựu và giải thưởng mà CLB và thành viên đã đạt được",
    description: "Các thành tựu và giải thưởng mà CLB và thành viên đã đạt được",
    heroImage: "/images/hero-images/achievements.jpg",
  },
  about: {
    title: "Về CLB MPC",
    subtitle: "Tìm hiểu về lịch sử, mục tiêu và lộ trình đào tạo của CLB",
    description: "Tìm hiểu về lịch sử, mục tiêu và lộ trình đào tạo của CLB",
    heroImage: "/images/hero-images/about.jpg",
  },
} as const;

// ==================== HOME PAGE SECTIONS ====================
export const HOME_SECTIONS = {
  intro: {
    title: "Giới thiệu CLB MPC",
    description:
      "Câu lạc bộ Lập trình trên thiết bị di động (Mobile Programming Club - MPC) là một trong những câu lạc bộ hoạt động năng động, sôi nổi và đầy sáng tạo của Khoa Công nghệ thông tin - Trường Đại học Mở Tp.HCM. MPC được thành lập với mục tiêu tạo ra một môi trường học tập, nghiên cứu và phát triển công nghệ thông tin không chỉ trên thiết bị di động như web, mobile app,... mà còn nhiều ngành phổ biến khác cho sinh viên Khoa CNTT, cũng như các bạn yêu thích lập trình.",
    image: "/images/hero-images/about.jpg",
  },
  benefits: {
    title: "Lợi ích khi tham gia CLB",
    items: [
      {
        title: "Phát triển kỹ năng",
        description: "Học và thực hành các công nghệ mới nhất trong lĩnh vực Web, App và AI.",
      },
      {
        title: "Mạng lưới kết nối",
        description: "Gặp gỡ và làm việc với những người có cùng đam mê và định hướng.",
      },
      {
        title: "Cơ hội tham gia",
        description: "Tham gia các dự án thực tế, cuộc thi và sự kiện công nghệ.",
      },
    ],
  },
  organization: {
    title: "Tổ chức CLB",
    presidents: {
      title: "Ban Chủ nhiệm",
      items: [
      {
        name: "Nguyễn Văn A",
        role: "Chủ nhiệm",
        period: "Nhiệm kỳ 2024-2025",
        avatar: "/images/members/president1.jpg",
        social: {
          email: "president1@mpc.club",
          facebook: "https://facebook.com/president1",
          github: "https://github.com/president1",
        },
      },
      {
        name: "Trần Thị B",
        role: "Phó Chủ nhiệm",
        period: "Nhiệm kỳ 2024-2025",
        avatar: "/images/members/president2.jpg",
        social: {
          email: "president2@mpc.club",
          facebook: "https://facebook.com/president2",
          github: "https://github.com/president2",
        },
      },
      {
        name: "Lê Văn C",
        role: "Phó Chủ nhiệm",
        period: "Nhiệm kỳ 2024-2025",
        avatar: "/images/members/president3.jpg",
        social: {
          email: "president3@mpc.club",
          facebook: "https://facebook.com/president3",
          github: "https://github.com/president3",
          },
        },
      ],
    },
    officers: {
      title: "Ban Cán sự",
      items: [
        {
          name: "Phạm Thị D",
          role: "Cán sự",
          period: "Nhiệm kỳ 2024-2025",
          avatar: "/images/members/officer1.jpg",
          social: {
            email: "officer1@mpc.club",
            facebook: "https://facebook.com/officer1",
            github: "https://github.com/officer1",
          },
        },
        {
          name: "Hoàng Văn E",
          role: "Cán sự",
          period: "Nhiệm kỳ 2024-2025",
          avatar: "/images/members/officer2.jpg",
          social: {
            email: "officer2@mpc.club",
            facebook: "https://facebook.com/officer2",
            github: "https://github.com/officer2",
          },
        },
        {
          name: "Võ Thị F",
          role: "Cán sự",
          period: "Nhiệm kỳ 2024-2025",
          avatar: "/images/members/officer3.jpg",
          social: {
            email: "officer3@mpc.club",
            facebook: "https://facebook.com/officer3",
            github: "https://github.com/officer3",
          },
        },
        {
          name: "Đỗ Văn G",
          role: "Cán sự",
          period: "Nhiệm kỳ 2024-2025",
          avatar: "/images/members/officer4.jpg",
          social: {
            email: "officer4@mpc.club",
            facebook: "https://facebook.com/officer4",
            github: "https://github.com/officer4",
          },
        },
        {
          name: "Bùi Thị H",
          role: "Cán sự",
          period: "Nhiệm kỳ 2024-2025",
          avatar: "/images/members/officer5.jpg",
          social: {
            email: "officer5@mpc.club",
            facebook: "https://facebook.com/officer5",
            github: "https://github.com/officer5",
          },
        },
        {
          name: "Ngô Văn I",
          role: "Cán sự",
          period: "Nhiệm kỳ 2024-2025",
          avatar: "/images/members/officer6.jpg",
          social: {
            email: "officer6@mpc.club",
            facebook: "https://facebook.com/officer6",
            github: "https://github.com/officer6",
          },
        },
      ],
    },
  },
  gallery: {
    title: "Một số hình ảnh",
  },
  articles: {
    title: "Bài viết nổi bật",
    viewAll: "Xem tất cả",
    viewMore: "Đọc thêm →",
  },
  faq: {
    title: "Giải đáp thắc mắc",
    description: "Dưới đây là những câu hỏi phổ biến thường được các bạn dành cho CLB.",
    items: [
      {
        q: "Lịch sử hình thành CLB MPC?",
        a: "CLB Máy tính và Lập trình (MPC) được thành lập với mục tiêu tạo ra một môi trường học tập, nghiên cứu và phát triển công nghệ thông tin cho sinh viên Khoa CNTT, cũng như các bạn yêu thích lập trình.",
      },
      {
        q: "Mục tiêu của CLB?",
        a: "Xây dựng một cộng đồng lập trình viên năng động, hỗ trợ nhau phát triển và chia sẻ kiến thức, góp phần nâng cao chất lượng đào tạo công nghệ thông tin.",
      },
      {
        q: "Khi nào CLB tổ chức tuyển thành viên?",
        a: "CLB thường tổ chức tuyển thành viên vào đầu mỗi học kỳ. Thông tin chi tiết sẽ được thông báo trên website và fanpage của CLB.",
      },
      {
        q: "Không học CNTT có được tham gia CLB không?",
        a: "Có, CLB chào đón tất cả các bạn sinh viên yêu thích lập trình và công nghệ, không phân biệt ngành học.",
      },
      {
        q: "Chưa biết gì về CNTT có thể tham gia vào CLB được không?",
        a: "Hoàn toàn có thể! CLB có các khóa đào tạo từ cơ bản đến nâng cao, phù hợp với mọi trình độ. Chúng tôi tin rằng đam mê và sự kiên trì quan trọng hơn kinh nghiệm ban đầu.",
      },
      {
        q: "Đến hiện tại, CLB đã và đang có bao nhiêu thành viên?",
        a: "CLB hiện có hơn 100 thành viên đang hoạt động tích cực trong các lĩnh vực Web Development, App Development và Artificial Intelligence.",
      },
      {
        q: "Mô hình tổ chức của CLB?",
        a: "CLB được tổ chức theo mô hình phân cấp với Ban Chủ nhiệm (gồm Chủ nhiệm và các Phó Chủ nhiệm) và Ban Cán sự. Mỗi ban có trách nhiệm quản lý và điều phối các hoạt động của CLB.",
      },
      {
        q: "Làm thế nào để có thể tham gia vào CLB?",
        a: "Bạn có thể đăng ký tham gia CLB thông qua form đăng ký trên website hoặc liên hệ trực tiếp với ban cán sự qua email hoặc Facebook. Chúng tôi sẽ hướng dẫn bạn các bước tiếp theo.",
      },
    ],
  },
} as const;

// ==================== BUTTON LABELS ====================
export const BUTTONS = {
  learnMore: "Tìm hiểu thêm",
  viewMembers: "Xem thành viên",
  viewAll: "Xem tất cả",
  readMore: "Đọc thêm →",
  login: "LOGIN",
  search: "Tìm kiếm",
  backToEvents: "← Quay lại danh sách sự kiện",
  backToHome: "Về trang chủ",
  viewProfile: "Xem profile",
} as const;

// ==================== EVENTS PAGE ====================
export const EVENTS = {
  featured: {
    title: "Sự kiện nổi bật",
  },
  other: {
    title: "Các sự kiện khác",
  },
  intro: {
    title: "Giới thiệu chung",
    description:
      "CLB MPC thường xuyên tổ chức các sự kiện, workshop và cuộc thi để tạo cơ hội cho thành viên học hỏi và phát triển. Các sự kiện bao gồm hackathon, workshop công nghệ, cuộc thi lập trình và nhiều hoạt động khác.",
  },
} as const;

// ==================== ACHIEVEMENTS PAGE ====================
export const ACHIEVEMENTS = {
  presidents: {
    title: "Ban Chủ nhiệm tiền nhiệm",
  },
  collective: {
    title: "Giải thưởng tập thể",
  },
  individual: {
    title: "Giải thưởng cá nhân",
  },
} as const;

// ==================== ABOUT PAGE ====================
export const ABOUT = {
  intro: {
    description:
      "CLB Máy tính và Lập trình được thành lập với mục tiêu tạo ra một môi trường học tập và phát triển cho các bạn sinh viên đam mê công nghệ. Chúng tôi cung cấp các khóa đào tạo từ cơ bản đến nâng cao, kèm theo các dự án thực tế để thành viên có thể áp dụng kiến thức đã học.",
  },
  training: {
    title: "Lộ trình đào tạo",
  },
} as const;

// ==================== PROJECTS ====================
export const PROJECTS = {
  specialties: [
    {
      title: "Web Development",
      description: "Phát triển ứng dụng web hiện đại với các công nghệ mới nhất",
    },
    {
      title: "App Development",
      description: "Xây dựng ứng dụng di động cho iOS và Android",
    },
    {
      title: "Artificial Intelligence",
      description: "Nghiên cứu và phát triển các ứng dụng AI/ML",
    },
  ],
} as const;

// ==================== TRAINING PATHS ====================
export const TRAINING_PATHS = [
  {
    title: "Web Development",
    description: "Từ HTML/CSS cơ bản đến các framework hiện đại như React, Next.js, Vue.js",
    duration: "6 tháng",
  },
  {
    title: "App Development",
    description: "Phát triển ứng dụng di động cho iOS và Android",
    duration: "6 tháng",
  },
  {
    title: "Artificial Intelligence",
    description: "Từ Machine Learning cơ bản đến Deep Learning và các ứng dụng thực tế",
    duration: "8 tháng",
  },
] as const;

// ==================== PLACEHOLDERS ====================
export const PLACEHOLDERS = {
  articleTitle: "Tiêu đề bài viết",
  articleDescription: "Mô tả ngắn về bài viết này sẽ được hiển thị ở đây...",
  officerName: "Cán sự",
  search: "Tìm kiếm bài viết...",
} as const;

