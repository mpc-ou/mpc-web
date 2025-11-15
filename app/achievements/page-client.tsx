"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Award, Users, ChevronLeft, ChevronRight, Github, Facebook, Mail } from "lucide-react";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { PAGES, ACHIEVEMENTS } from "@/lib/constants";
import { LAYOUT_CONFIG, PRESIDENTS_SLIDER_CONFIG } from "@/lib/config";

interface President {
  name: string;
  period: string;
  role: string;
  image: string | null;
  social?: {
    github?: string;
    facebook?: string;
    email?: string;
  };
}

export default function AchievementsPageClient() {
  const pastPresidents: President[] = [
    {
      name: "Nguyễn Văn A",
      period: "2022-2023",
      role: "Chủ nhiệm CLB",
      image: null,
      social: {
        github: "https://github.com/nguyenvana",
        facebook: "https://facebook.com/nguyenvana",
        email: "nguyenvana@example.com",
      },
    },
    {
      name: "Trần Thị B",
      period: "2021-2022",
      role: "Chủ nhiệm CLB",
      image: null,
      social: {
        github: "https://github.com/tranthib",
        facebook: "https://facebook.com/tranthib",
        email: "tranthib@example.com",
      },
    },
    {
      name: "Lê Văn C",
      period: "2020-2021",
      role: "Chủ nhiệm CLB",
      image: null,
      social: {
        github: "https://github.com/levanc",
        email: "levanc@example.com",
      },
    },
    {
      name: "Phạm Thị D",
      period: "2019-2020",
      role: "Chủ nhiệm CLB",
      image: null,
      social: {
        github: "https://github.com/phamthid",
        facebook: "https://facebook.com/phamthid",
      },
    },
    {
      name: "Hoàng Văn E",
      period: "2018-2019",
      role: "Chủ nhiệm CLB",
      image: null,
      social: {
        email: "hoangvane@example.com",
      },
    },
  ];

  // Slider state - sử dụng virtual index để tạo cảm giác vô tận
  const [virtualIndex, setVirtualIndex] = useState(pastPresidents.length); // Bắt đầu ở giữa bản sao
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Tính số items hiển thị - tránh hydration mismatch
  const [visibleCount, setVisibleCount] = useState(3); // Default cho SSR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const getVisibleCount = () => {
      const width = window.innerWidth;
      return width < 640 ? 1 : width < 1024 ? 2 : 3;
    };
    
    setVisibleCount(getVisibleCount());
    
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tạo duplicated items để loop vô tận (3 bản sao)
  const duplicatedPresidents = [
    ...pastPresidents,
    ...pastPresidents,
    ...pastPresidents,
  ];
  const offset = pastPresidents.length; // Offset để bắt đầu ở bản sao giữa

  // Tính index thực tế từ virtual index
  const getActualIndex = (virtual: number) => virtual % pastPresidents.length;

  // Chuyển item với loop vô tận
  const goToVirtualIndex = (newVirtualIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setVirtualIndex(newVirtualIndex);
    setTimeout(() => setIsTransitioning(false), 150);
  };

  const next = () => {
    const nextVirtual = virtualIndex + 1;
    goToVirtualIndex(nextVirtual);
  };

  const prev = () => {
    const prevVirtual = virtualIndex - 1;
    goToVirtualIndex(prevVirtual);
  };

  // Reset về giữa khi đến gần đầu/cuối để tạo cảm giác vô tận
  useEffect(() => {
    if (!sliderRef.current || isTransitioning) return;

    const totalItems = duplicatedPresidents.length;
    
    // Nếu đang ở quá gần đầu bản sao đầu tiên, jump đến giữa bản sao thứ 2
    if (virtualIndex < offset / 2) {
      const newVirtual = virtualIndex + offset;
      setVirtualIndex(newVirtual);
      // Reset transform ngay lập tức (không transition)
      if (containerRef.current && sliderRef.current) {
        const container = containerRef.current;
        const slider = sliderRef.current;
        const containerWidth = container.offsetWidth;
        const gap = 24;
        const itemWidth = (containerWidth - gap * (visibleCount - 1)) / visibleCount;
        const centerX = containerWidth / 2;
        const itemCenterX = newVirtual * (itemWidth + gap) + itemWidth / 2;
        const translateX = centerX - itemCenterX;
        
        slider.style.transition = "none";
        slider.style.transform = `translateX(${translateX}px)`;
        
        // Force reflow
        void slider.offsetHeight;
        
        // Cho phép transition lại
        setTimeout(() => {
          slider.style.transition = "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
        }, 50);
      }
      return;
    }
    
    // Nếu đang ở quá gần cuối bản sao cuối cùng, jump về giữa bản sao thứ 2
    if (virtualIndex >= totalItems - offset / 2) {
      const newVirtual = virtualIndex - offset;
      setVirtualIndex(newVirtual);
      // Reset transform ngay lập tức (không transition)
      if (containerRef.current && sliderRef.current) {
        const container = containerRef.current;
        const slider = sliderRef.current;
        const containerWidth = container.offsetWidth;
        const gap = 24;
        const itemWidth = (containerWidth - gap * (visibleCount - 1)) / visibleCount;
        const centerX = containerWidth / 2;
        const itemCenterX = newVirtual * (itemWidth + gap) + itemWidth / 2;
        const translateX = centerX - itemCenterX;
        
        slider.style.transition = "none";
        slider.style.transform = `translateX(${translateX}px)`;
        
        // Force reflow
        void slider.offsetHeight;
        
        // Cho phép transition lại
        setTimeout(() => {
          slider.style.transition = "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
        }, 50);
      }
      return;
    }
  }, [virtualIndex, visibleCount, isTransitioning]);

  // Tính toán vị trí để item active ở giữa
  useEffect(() => {
    if (!containerRef.current || !sliderRef.current || isTransitioning) return;

    const container = containerRef.current;
    const slider = sliderRef.current;
    const containerWidth = container.offsetWidth;
    const gap = 24; // 1.5rem = 24px
    const itemWidth = (containerWidth - gap * (visibleCount - 1)) / visibleCount;
    
    // Vị trí để item active ở giữa container
    const centerX = containerWidth / 2;
    const itemCenterX = virtualIndex * (itemWidth + gap) + itemWidth / 2;
    const translateX = centerX - itemCenterX;

    slider.style.transform = `translateX(${translateX}px)`;
    slider.style.transition = "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
  }, [virtualIndex, visibleCount, isTransitioning]);

  // Auto-play
  useEffect(() => {
    if (!PRESIDENTS_SLIDER_CONFIG.autoPlay || pastPresidents.length <= 1 || isTransitioning) return;
    
    const timer = setInterval(() => {
      next();
    }, PRESIDENTS_SLIDER_CONFIG.autoPlayInterval);

    return () => clearInterval(timer);
  }, [virtualIndex, pastPresidents.length, isTransitioning]);

  // Swipe handler
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) next();
    if (isRightSwipe) prev();
  };

  const collectiveAwards = [
    {
      title: "Giải nhất Cuộc thi Hackathon 2023",
      description: "CLB đạt giải nhất trong cuộc thi Hackathon cấp trường",
      year: "2023",
    },
    {
      title: "CLB xuất sắc nhất năm",
      description: "Vinh danh CLB xuất sắc nhất trong hoạt động cộng đồng",
      year: "2022",
    },
  ];

  const individualAwards = [
    {
      name: "Thành viên A",
      award: "Giải nhất Web Design Competition",
      event: "Cuộc thi Web Design 2024",
    },
    {
      name: "Thành viên B",
      award: "Giải nhì App Development",
      event: "Cuộc thi App Development 2023",
    },
    {
      name: "Thành viên C",
      award: "Giải ba AI Challenge",
      event: "Cuộc thi AI Challenge 2023",
    },
  ];

  return (
    <>
      <HeroSection
        title={PAGES.achievements.title}
        subtitle={PAGES.achievements.subtitle}
        image={PAGES.achievements.heroImage}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
            {PAGES.achievements.title}
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            {PAGES.achievements.description}
          </p>
        </div>

        {/* Past Presidents */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-[var(--primary)]" />
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {ACHIEVEMENTS.presidents.title}
            </h2>
          </div>
          
          {/* Slider Container */}
          <div 
            className="relative overflow-hidden"
            ref={containerRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Navigation Buttons */}
            {pastPresidents.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 h-10 w-10 rounded-full shadow-lg bg-[var(--bg-primary)] border-[var(--border)] hover:bg-[var(--bg-secondary)]"
                  onClick={prev}
                  aria-label="Trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 h-10 w-10 rounded-full shadow-lg bg-[var(--bg-primary)] border-[var(--border)] hover:bg-[var(--bg-secondary)]"
                  onClick={next}
                  aria-label="Sau"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Slider */}
            <div
              ref={sliderRef}
              className="flex gap-6"
            >
              {duplicatedPresidents.map((president, idx) => {
                const actualIdx = getActualIndex(idx);
                const isActive = getActualIndex(virtualIndex) === actualIdx && 
                                 Math.abs(idx - virtualIndex) < pastPresidents.length;
                
                // Tính width dựa trên visibleCount, nhưng chỉ sau khi mount để tránh hydration mismatch
                const widthStyle = isMounted 
                  ? { width: `calc((100% - ${(visibleCount - 1) * 24}px) / ${visibleCount})` }
                  : { width: "100%" }; // Default cho SSR
                
                return (
                  <div
                    key={`president-${idx}`}
                    className="flex-shrink-0"
                    style={widthStyle}
                    suppressHydrationWarning
                  >
                    <Card 
                      className={`text-center h-full transition-all duration-300 ${
                        isActive
                          ? "scale-105 shadow-lg border-[var(--primary)]" 
                          : "opacity-70"
                      }`}
                    >
                      <CardHeader>
                        <div className="w-32 h-32 rounded-full bg-[var(--muted)] mx-auto mb-4 flex items-center justify-center">
                          {pastPresidents[actualIdx].image ? (
                            <img
                              src={pastPresidents[actualIdx].image}
                              alt={pastPresidents[actualIdx].name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-16 w-16 text-[var(--text-tertiary)]" />
                          )}
                        </div>
                        <CardTitle className="mb-1">{pastPresidents[actualIdx].name}</CardTitle>
                        <CardDescription className="text-sm text-[var(--primary)] font-medium">
                          {pastPresidents[actualIdx].role}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <CardDescription className="text-base">
                          Nhiệm kỳ: {pastPresidents[actualIdx].period}
                        </CardDescription>
                        
                        {/* Social Links */}
                        {pastPresidents[actualIdx].social && (
                          <div className="flex justify-center gap-3 pt-2">
                            {pastPresidents[actualIdx].social?.github && (
                              <a
                                href={pastPresidents[actualIdx].social.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                                aria-label="GitHub"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                            {pastPresidents[actualIdx].social?.facebook && (
                              <a
                                href={pastPresidents[actualIdx].social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                                aria-label="Facebook"
                              >
                                <Facebook className="h-4 w-4" />
                              </a>
                            )}
                            {pastPresidents[actualIdx].social?.email && (
                              <a
                                href={`mailto:${pastPresidents[actualIdx].social.email}`}
                                className="p-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
                                aria-label="Email"
                              >
                                <Mail className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            {pastPresidents.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {pastPresidents.map((_, idx) => (
                  <button
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getActualIndex(virtualIndex) === idx
                        ? "w-8 bg-[var(--primary)]"
                        : "w-2 bg-[var(--muted)]"
                    }`}
                    onClick={() => {
                      // Tính virtual index tương ứng với actual index
                      const currentActual = getActualIndex(virtualIndex);
                      const diff = idx - currentActual;
                      goToVirtualIndex(virtualIndex + diff);
                    }}
                    aria-label={`Đi đến item ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Collective Awards */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-8 w-8 text-[var(--warning)]" />
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {ACHIEVEMENTS.collective.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collectiveAwards.map((award, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Trophy className="h-6 w-6 text-[var(--warning)]" />
                    <span className="text-sm text-[var(--text-secondary)]">
                      {award.year}
                    </span>
                  </div>
                  <CardTitle>{award.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{award.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Individual Awards */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-8 w-8 text-[var(--accent)]" />
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {ACHIEVEMENTS.individual.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualAwards.map((award, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{award.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-[var(--accent)]" />
                      <span className="font-semibold">{award.award}</span>
                    </div>
                    <CardDescription>{award.event}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

