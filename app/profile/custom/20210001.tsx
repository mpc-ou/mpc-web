/**
 * CUSTOM PROFILE TEMPLATE - VÍ DỤ MẪU
 * 
 * Đây là một ví dụ về cách tạo custom profile page.
 * Copy file này và đổi tên thành {studentId}.tsx trong folder app/profile/custom/
 * 
 * Ví dụ: Nếu studentId là "20210001", đổi tên thành: 20210001.tsx
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Mail, 
  Facebook, 
  Linkedin, 
  Code, 
  Award,
  Calendar,
  MapPin,
  User
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * Interface cho ProfileData - Tất cả các biến có sẵn trong custom profile
 */
interface ProfileData {
  // Thông tin cơ bản
  id: string;                    // Mã số sinh viên
  name: string;                  // Tên thành viên
  email: string;                 // Email
  role: string;                  // Vai trò trong CLB (Chủ nhiệm, Cán sự, Thành viên, etc.)
  avatar: string | null;         // URL ảnh đại diện
  bio: string | null;            // Giới thiệu ngắn
  
  // Thông tin từ database (có thể null nếu chưa set)
  student_id: string;
  created_at?: string;
  updated_at?: string;
  
  // Social links (có thể thêm vào database sau)
  social?: {
    github?: string;
    facebook?: string;
    linkedin?: string;
    portfolio?: string;
  };
  
  // Kỹ năng và sở thích (có thể thêm vào database sau)
  skills?: string[];
  interests?: string[];
}

interface CustomProfileProps {
  profile: ProfileData;
}

/**
 * Component Custom Profile Mẫu
 * 
 * Bạn có thể tùy chỉnh hoàn toàn layout, style, và nội dung ở đây.
 * Sử dụng các biến từ `profile` prop để hiển thị thông tin.
 */
export default function ExampleCustomProfile({ profile }: CustomProfileProps) {
  // Thông tin mẫu - bạn có thể thay bằng data từ profile hoặc hardcode
  const skills = profile.skills || ["React", "Next.js", "TypeScript", "Tailwind CSS"];
  const interests = profile.interests || ["Web Development", "UI/UX Design", "Open Source"];
  const social = profile.social || {
    github: "https://github.com/username",
    facebook: "https://facebook.com/username",
    linkedin: "https://linkedin.com/in/username",
  };

  return (
    <div className="container mx-auto px-4 py-36">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <Card className="mb-8 border-2 border-[var(--primary)]">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-1">
                  {profile.avatar ? (
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--muted)] flex items-center justify-center">
                      <User className="h-16 w-16 text-[var(--text-tertiary)]" />
                    </div>
                  )}
                </div>
                {profile.role === "Chủ nhiệm" && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">★</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-[var(--text-primary)]">
                  {profile.name}
                </h1>
                <p className="text-xl text-[var(--text-secondary)] mb-2">
                  {profile.role} tại CLB MPC
                </p>
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Mã số sinh viên: {profile.id}
                </p>
                
                {/* Social Links */}
                <div className="flex gap-3 justify-center md:justify-start">
                  {social.github && (
                    <Button variant="outline" size="icon" asChild>
                      <Link href={social.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                  {social.facebook && (
                    <Button variant="outline" size="icon" asChild>
                      <Link href={social.facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                  {social.linkedin && (
                    <Button variant="outline" size="icon" asChild>
                      <Link href={social.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                  {profile.email && (
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`mailto:${profile.email}`}>
                        <Mail className="h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--primary)]" />
                  Giới thiệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {profile.bio || "Chào mừng đến với trang profile của tôi! Tôi là một thành viên năng động của CLB MPC, yêu thích lập trình và phát triển công nghệ."}
                </p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-[var(--primary)]" />
                  Kỹ năng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[var(--primary)]" />
                  Sở thích
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)]">
                  {interests.map((interest, idx) => (
                    <li key={idx}>{interest}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <a 
                      href={`mailto:${profile.email}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
                    >
                      {profile.email}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">
                    Trường Đại học Mở Tp.HCM
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">
                    Thành viên từ {profile.created_at ? new Date(profile.created_at).getFullYear() : "2024"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Dự án đã tham gia</span>
                    <span className="font-semibold text-[var(--text-primary)]">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Sự kiện đã tham dự</span>
                    <span className="font-semibold text-[var(--text-primary)]">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Contributions</span>
                    <span className="font-semibold text-[var(--text-primary)]">42</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

