"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";

export default function AdminDashboard() {
  const stats = [
    { label: "Thành viên", value: "150+", icon: Users },
    { label: "Sự kiện", value: "20+", icon: Calendar },
    { label: "Bài viết", value: "50+", icon: FileText },
  ];

  return (
    <>
      <HeroSection
        title="Admin Dashboard"
        subtitle="Quản lý nội dung và cài đặt website"
      />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{stat.label}</CardTitle>
                    <Icon className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý nội dung</CardTitle>
              <CardDescription>
                Quản lý bài viết, sự kiện, và thành viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/posts">Quản lý bài viết</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/events">Quản lý sự kiện</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/members">Quản lý thành viên</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cài đặt</CardTitle>
              <CardDescription>
                Cấu hình màu sắc và thiết lập website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt màu sắc
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
