import type {
  LocalizedText,
  WebDesignBenefit,
  WebDesignExhibitionItem,
  WebDesignFaq,
  WebDesignMilestone,
  WebDesignPrize,
  WebDesignRegulation
} from "@/types/webdesign";
import { generateId } from "@/utils/webdesign-validate";

export const EMPTY_TEXT: LocalizedText = { vi: "", en: "" };

export const emptyPrize = (): WebDesignPrize => ({
  id: generateId(),
  tier: "gold",
  title: { ...EMPTY_TEXT },
  description: { ...EMPTY_TEXT }
});

export const emptyBenefit = (): WebDesignBenefit => ({
  id: generateId(),
  title: { ...EMPTY_TEXT },
  description: { ...EMPTY_TEXT }
});

export const emptyMilestone = (): WebDesignMilestone => ({
  id: generateId(),
  start: "",
  end: "",
  title: { ...EMPTY_TEXT },
  description: { ...EMPTY_TEXT }
});

export const emptyRegulation = (): WebDesignRegulation => ({
  id: generateId(),
  title: { ...EMPTY_TEXT },
  items: [{ ...EMPTY_TEXT }]
});

export const emptyFaq = (): WebDesignFaq => ({
  id: generateId(),
  question: { ...EMPTY_TEXT },
  answer: { ...EMPTY_TEXT },
  isActive: true
});

export const EMPTY_EXHIBITION: WebDesignExhibitionItem = {
  teamName: "",
  teamMembers: [],
  subjects: "",
  projectName: { ...EMPTY_TEXT },
  description: { ...EMPTY_TEXT },
  github: "",
  live: "",
  thumbnail: "",
  techStack: []
};

export const defaultPrizes = (): WebDesignPrize[] => [
  {
    id: generateId(),
    tier: "gold",
    title: { vi: "Giải nhất", en: "1st Prize" },
    description: {
      vi: "Trị giá hơn 1.000.000 VNĐ, quà đặc biệt của nhà tài trợ và cúp chứng nhận",
      en: "Worth over 1,000,000 VND, a special sponsor gift and a trophy"
    }
  },
  {
    id: generateId(),
    tier: "silver",
    title: { vi: "Giải nhì", en: "2nd Prize" },
    description: {
      vi: "Trị giá hơn 700.000 VNĐ, quà đặc biệt của nhà tài trợ và cúp chứng nhận",
      en: "Worth over 700,000 VND, a special sponsor gift and a trophy"
    }
  },
  {
    id: generateId(),
    tier: "bronze",
    title: { vi: "Giải ba", en: "3rd Prize" },
    description: {
      vi: "Trị giá hơn 500.000 VNĐ, quà đặc biệt của nhà tài trợ và cúp chứng nhận",
      en: "Worth over 500,000 VND, a special sponsor gift and a trophy"
    }
  }
];

export const defaultBenefits = (): WebDesignBenefit[] => [
  {
    id: generateId(),
    title: { vi: "Giấy chứng nhận & DRL", en: "Certificate & Training Points" },
    description: {
      vi: "Tất cả thí sinh hoàn thành bài thi đều nhận được Giấy chứng nhận tham gia. Nhận +5 điểm rèn luyện (theo Điều 1).",
      en: "All contestants who complete the contest receive a Certificate of Participation and +5 training points."
    }
  },
  {
    id: generateId(),
    title: { vi: "Dành cho Cổ động viên", en: "For Supporters" },
    description: {
      vi: "Tham gia cổ vũ Đêm Chung kết nhận ngay +2 điểm rèn luyện (Điều 1) & vé Lucky Draw với quà công nghệ hấp dẫn.",
      en: "Join and cheer at the Final Night to receive +2 training points & a Lucky Draw ticket with tech prizes."
    }
  }
];

/** Sample phases - the dates are placeholders the admin is expected to adjust. */
export const sampleMilestones = (): WebDesignMilestone[] => [
  {
    id: generateId(),
    start: "2026-10-01T00:00",
    end: "2026-10-31T23:59",
    title: { vi: "Mở đăng ký & Truyền thông", en: "Registration & Media" },
    description: {
      vi: "Mở cổng đăng ký trực tuyến, công bố thể lệ chính thức và chủ đề trọng tâm của năm.",
      en: "Open online registration, announce official rules and the year's main theme."
    }
  },
  {
    id: generateId(),
    start: "2026-11-01T00:00",
    end: "2026-11-10T23:59",
    title: { vi: "Vòng loại", en: "Qualifiers" },
    description: {
      vi: "Các đội phác thảo giao diện trên Figma/Canva, Hội đồng duyệt ý tưởng và định hướng công nghệ.",
      en: "Teams draft web interface on Figma/Canva, the committee reviews ideas and tech stacks."
    }
  },
  {
    id: generateId(),
    start: "2026-11-11T00:00",
    end: "2026-11-30T23:59",
    title: { vi: "Triển khai", en: "Implementation" },
    description: {
      vi: "Các đội thi lập trình hoàn thiện website trong 2-3 tuần và kiểm tra điều kiện chung kết.",
      en: "Teams code and complete their websites in 2-3 weeks and check eligibility for the finals."
    }
  },
  {
    id: generateId(),
    start: "2026-12-05T08:00",
    end: "2026-12-05T17:00",
    title: { vi: "Chung kết", en: "Finals" },
    description: {
      vi: "Top các đội xuất sắc nhất thuyết trình Slide + Demo Website và trả lời phản biện trước Hội đồng.",
      en: "Top finalist teams present Slide + Demo Website and answer questions from the Judges."
    }
  }
];

const rule = (title: LocalizedText, items: [vi: string, en: string][]): WebDesignRegulation => ({
  id: generateId(),
  title,
  items: items.map(([vi, en]) => ({ vi, en }))
});

export const sampleRegulations = (): WebDesignRegulation[] => [
  rule({ vi: "Đối tượng & đội thi", en: "Eligibility & teams" }, [
    [
      "Mỗi đội gồm từ 2–3 thành viên là sinh viên theo học CNTT hoặc đam mê CNTT.",
      "Each team has 2–3 members who study IT or are passionate about IT."
    ],
    [
      "Thí sinh đăng ký đơn lẻ sẽ được BTC hỗ trợ ghép đội.",
      "Solo registrants will be matched into teams by the organizers."
    ]
  ]),
  rule({ vi: "Công nghệ sử dụng", en: "Technology" }, [
    [
      "Không giới hạn công nghệ. Yêu cầu tối thiểu: website chạy được với HTML, CSS và JS.",
      "No technology restrictions. Minimum requirement: the website runs with HTML, CSS and JS."
    ],
    ["Không yêu cầu cơ sở dữ liệu hay Backend.", "No database or backend is required."]
  ]),
  rule({ vi: "Template & công cụ AI", en: "Templates & AI tools" }, [
    [
      "Được dùng template ở mức tham khảo hoặc kế thừa khung cơ bản; ưu tiên tính tự thiết kế.",
      "Templates may be used as reference or as a basic skeleton; original design is preferred."
    ],
    [
      "AI được phép hỗ trợ viết code, thành viên phải hiểu rõ mã nguồn của mình.",
      "AI may assist with writing code, but members must fully understand their source code."
    ],
    [
      "Không dùng AI tạo sinh cho toàn bộ hình ảnh hoặc nội dung thô chưa qua chỉnh sửa.",
      "Do not use generative AI for all imagery or unedited raw content."
    ]
  ]),
  rule({ vi: "Quản lý mã nguồn", en: "Source control" }, [
    ["Bắt buộc dùng một kho GitHub chung cho cả đội.", "Each team must use one shared GitHub repository."],
    [
      "Lịch sử commit là minh chứng đóng góp của từng thành viên.",
      "Commit history serves as evidence of each member's contribution."
    ]
  ]),
  rule({ vi: "Sản phẩm bàn giao", en: "Deliverables" }, [
    [
      "Website đã triển khai trên internet (Vercel, GitHub Pages,…).",
      "A website deployed to the internet (Vercel, GitHub Pages,…)."
    ],
    ["Liên kết GitHub công khai (public).", "A public GitHub link."],
    ["File Slide trình bày cho vòng Chung kết.", "Presentation slides for the Finals."]
  ]),
  rule({ vi: "Vòng Chung kết", en: "Finals" }, [
    [
      "Mỗi đội có 10–15 phút thuyết trình (Slide + Website thực tế).",
      "Each team has 10–15 minutes to present (Slides + live website)."
    ],
    [
      "15–20 phút trả lời phản biện; kết quả công bố ngay trong đêm.",
      "15–20 minutes of Q&A with the judges; results are announced the same night."
    ]
  ])
];
