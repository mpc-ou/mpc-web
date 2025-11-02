import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;

  // Mock data - sẽ thay bằng data từ Supabase sau
  const eventData: Record<string, any> = {
    webdesign: {
      title: "Cuộc thi Web Design 2024",
      description: "Cuộc thi thiết kế website dành cho sinh viên với nhiều giải thưởng hấp dẫn",
      date: "15/03/2024",
      location: "Trường Đại học XYZ",
      participants: "50+",
      content: `
        <h2>Giới thiệu</h2>
        <p>Cuộc thi Web Design 2024 là một sự kiện thường niên của CLB MPC, nhằm tạo sân chơi cho các bạn sinh viên yêu thích thiết kế và phát triển website.</p>
        
        <h2>Thể lệ cuộc thi</h2>
        <ul>
          <li>Thí sinh thiết kế một website theo chủ đề được công bố</li>
          <li>Thời gian: 2 tuần</li>
          <li>Nộp bài qua form online</li>
        </ul>
        
        <h2>Giải thưởng</h2>
        <ul>
          <li>Giải nhất: 5,000,000 VNĐ</li>
          <li>Giải nhì: 3,000,000 VNĐ</li>
          <li>Giải ba: 2,000,000 VNĐ</li>
        </ul>
      `,
    },
  };

  const event = eventData[slug];
  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/events">
          <Button variant="ghost" className="mb-6">
            ← Quay lại danh sách sự kiện
          </Button>
        </Link>

        <article>
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
              {event.title}
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-6">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-6 text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{event.participants} người tham gia</span>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="prose prose-lg max-w-none pt-6">
              <div
                dangerouslySetInnerHTML={{ __html: event.content }}
                className="space-y-4"
              />
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
