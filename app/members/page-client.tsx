"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { BUTTONS } from "@/lib/constants";
import { LAYOUT_CONFIG } from "@/lib/config";

export default function MembersPageClient() {
  // Mock data - sẽ thay bằng data từ Supabase sau
  const members = [
    { id: "20210001", name: "Nguyễn Văn A", role: "Chủ nhiệm", avatar: null },
    { id: "20210002", name: "Trần Thị B", role: "Cán sự", avatar: null },
    { id: "20210003", name: "Lê Văn C", role: "Thành viên", avatar: null },
    { id: "20210004", name: "Phạm Thị D", role: "Thành viên", avatar: null },
    { id: "20210005", name: "Hoàng Văn E", role: "Thành viên", avatar: null },
    { id: "20210006", name: "Võ Thị F", role: "Thành viên", avatar: null },
  ];

  return (
    <div className="container mx-auto px-4 py-36">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
          Thành viên CLB
        </h1>
        <p className="text-xl text-[var(--text-secondary)]">
          Khám phá các thành viên của CLB và trang cá nhân của họ
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <Link key={member.id} href={`/profile/${member.id}`}>
            <Card className="group hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-[var(--muted)] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-[var(--text-tertiary)]" />
                      )}
                    </div>
                    {member.role === "Chủ nhiệm" && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <span className="text-xs text-white">★</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {member.role}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {member.id}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    {BUTTONS.viewProfile}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

