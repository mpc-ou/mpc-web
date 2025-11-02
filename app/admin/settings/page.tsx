"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeroSection } from "@/components/hero-section";
import { Save } from "lucide-react";

export default function AdminSettings() {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load current colors from CSS variables
    if (typeof window !== "undefined") {
      const computedStyle = getComputedStyle(document.documentElement);
      const colorKeys = [
        "l-primary",
        "l-accent",
        "l-success",
        "l-error",
        "l-warning",
        "l-info",
      ];
      const loadedColors: Record<string, string> = {};
      colorKeys.forEach((key) => {
        loadedColors[key] = computedStyle.getPropertyValue(`--${key}`).trim();
      });
      setColors(loadedColors);
    }
  }, []);

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save to localStorage or send to API
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
    localStorage.setItem("customColors", JSON.stringify(colors));
    alert("Đã lưu cài đặt!");
  };

  const colorFields = [
    { key: "l-primary", label: "Màu chủ đạo" },
    { key: "l-accent", label: "Màu nhấn" },
    { key: "l-success", label: "Màu thành công" },
    { key: "l-error", label: "Màu lỗi" },
    { key: "l-warning", label: "Màu cảnh báo" },
    { key: "l-info", label: "Màu thông tin" },
  ];

  return (
    <>
      <HeroSection
        title="Cài đặt màu sắc"
        subtitle="Tùy chỉnh màu sắc của website"
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt màu sắc (Light Mode)</CardTitle>
            <CardDescription>
              Thay đổi màu sắc của website. Các thay đổi sẽ được áp dụng ngay lập tức.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {colorFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={field.key}
                    type="color"
                    value={colors[field.key] || "#000000"}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={colors[field.key] || ""}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
            <Button onClick={handleSave} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Lưu cài đặt
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
