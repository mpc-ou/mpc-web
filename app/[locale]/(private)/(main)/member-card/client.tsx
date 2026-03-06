"use client";

import * as htmlToImage from "html-to-image";
import { Download, LayoutDashboard, LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type MemberCardProps = {
  data: {
    firstName: string;
    lastName: string;
    studentId: string;
    dob: string;
    department: string;
    joinedYear: string;
    avatar: string;
  };
  locale: string;
};

export function MemberCardClient({ data, locale }: MemberCardProps) {
  const t = useTranslations("profile.memberCard");
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [isDownloadingFront, setIsDownloadingFront] = useState(false);
  const [isDownloadingBack, setIsDownloadingBack] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(
    async (
      ref: React.RefObject<HTMLDivElement | null>,
      filename: string,
      setDownloading: (val: boolean) => void,
    ) => {
      if (!ref.current) {
        return;
      }
      setDownloading(true);

      try {
        const pixelRatio = 3;

        const dataUrl = await htmlToImage.toPng(ref.current, {
          quality: 1.0,
          pixelRatio,
          cacheBust: true,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
        });

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();

        toast({
          title: "Tải xuống thành công",
          description: `Đã tải thẻ ${filename} về máy.`,
        });
      } catch (err) {
        console.error(err);
        toast({
          variant: "destructive",
          title: "Tải xuống thất bại",
          description: "Không thể tạo hình ảnh thẻ. Vui lòng thử lại.",
        });
      } finally {
        setDownloading(false);
      }
    },
    [],
  );

  const cardWidth = isHorizontal ? 960 : 540;
  const cardHeight = isHorizontal ? 540 : 960;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Responsive scaling
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Leave 32px of padding on small screens
        const availableWidth = window.innerWidth - 32;
        const targetWidth = isHorizontal ? 960 : 540;
        let newScale = Math.min(1, availableWidth / targetWidth);

        // Make it even smaller on mobile to ensure it fits comfortably
        if (window.innerWidth < 640) {
          newScale = newScale * 0.85;
        }

        setScale(newScale);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [isHorizontal]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-8">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="font-bold text-3xl tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("cardTitle")} - {t("clubName")}
        </p>
      </div>

      <div className="mb-10 flex w-full max-w-2xl flex-wrap justify-center gap-4 rounded-2xl bg-slate-100 p-2 dark:bg-slate-900">
        <Button
          className="rounded-xl"
          onClick={() => setIsHorizontal(true)}
          variant={isHorizontal ? "default" : "ghost"}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Chiều ngang
        </Button>
        <Button
          className="rounded-xl"
          onClick={() => setIsHorizontal(false)}
          variant={isHorizontal ? "ghost" : "default"}
        >
          <LayoutTemplate className="mr-2 h-4 w-4" />
          Chiều dọc
        </Button>

        <div className="mx-2 hidden h-8 w-px self-center bg-border sm:block" />

        <Button
          className="rounded-xl border-orange-500/50 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400"
          disabled={isDownloadingFront}
          onClick={() =>
            handleDownload(
              frontRef,
              "MPC_Card_Front.png",
              setIsDownloadingFront,
            )
          }
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloadingFront ? "Đang xử lý..." : t("downloadFront")}
        </Button>
        <Button
          className="rounded-xl border-slate-500/50 hover:bg-slate-500/10"
          disabled={isDownloadingBack}
          onClick={() =>
            handleDownload(backRef, "MPC_Card_Back.png", setIsDownloadingBack)
          }
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloadingBack ? "Đang xử lý..." : t("downloadBack")}
        </Button>
      </div>

      {/* Wrapping container controls responsiveness. It scales down the fixed-size cards on small screens. */}
      <div
        className="flex w-full flex-col items-center gap-12 pb-16"
        ref={containerRef}
      >
        {/* ======== FRONT CARD ======== */}
        <div
          className="flex w-full justify-center transition-all duration-300"
          style={{ height: cardHeight * scale }}
        >
          <div
            className="relative shrink-0 origin-top overflow-hidden rounded-[32px] border border-orange-500/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-transform duration-300"
            style={{
              width: cardWidth,
              height: cardHeight,
              transform: `scale(${scale})`,
            }}
          >
            {/* The element we actually capture */}
            <div className="absolute inset-0 bg-white" ref={frontRef}>
              <div className="absolute inset-0 bg-[#fffdfa]" />{" "}
              {/* Off-white warm background */}
              {/* Grid pattern background */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #ea580c 1px, transparent 1px), linear-gradient(to bottom, #ea580c 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Decorative shapes */}
              <div className="pointer-events-none absolute -top-[20%] -right-[10%] h-[70%] w-[60%] rounded-full bg-orange-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-[20%] -left-[10%] h-[60%] w-[50%] rounded-full bg-amber-500/10 blur-3xl" />
              {/* Club logo watermark */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="pointer-events-none absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 -rotate-12 object-contain opacity-[0.04] grayscale"
                crossOrigin="anonymous"
                src="/images/logo.png"
              />
              {/* Card Content Layout */}
              <div
                className={`relative z-10 flex h-full w-full p-8 ${isHorizontal ? "flex-row" : "flex-col-reverse justify-end"} justify-between`}
              >
                {/* Left/Bottom Column (Barcode - Avatar is here only if horizontal) */}
                <div
                  className={`flex flex-col items-center justify-center gap-6 ${isHorizontal ? "w-[35%] border-r-2 pr-4 pb-4" : "mt-6 h-[auto] w-full border-t-2 pt-6"} relative border-orange-500/20 border-dashed`}
                >
                  {/* Avatar wrapper (Only show here if HORIZONTAL) */}
                  {isHorizontal && (
                    <div className="relative">
                      <div className="relative z-10 h-48 w-48 overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-[0_10px_30px_rgba(234,88,12,0.15)]">
                        {data.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt="Avatar"
                            className="h-full w-full object-cover"
                            crossOrigin="anonymous"
                            src={data.avatar}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-black text-5xl text-slate-300 uppercase">
                            {data.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 w-full text-center">
                    <div className="inline-block rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                      {data.studentId !== "Không có MSSV" ? (
                        // Using React Barcode. Setting format to CODE128 (default)
                        <Barcode
                          background="#ffffff"
                          displayValue={false}
                          fontSize={14}
                          height={45}
                          lineColor="#0f172a"
                          margin={0}
                          value={data.studentId}
                          width={isHorizontal ? 1.8 : 2}
                        />
                      ) : (
                        <div className="flex h-[45px] w-[160px] items-center justify-center border-2 border-slate-200 border-dashed font-bold text-slate-400 text-sm">
                          NO ID
                        </div>
                      )}
                    </div>
                    <div className="mt-3 font-bold font-mono text-slate-600 text-sm tracking-[0.2em]">
                      {data.studentId}
                    </div>
                  </div>
                </div>

                {/* Right/Top Column (Details) */}
                <div
                  className={`flex flex-col ${isHorizontal ? "w-[65%] pt-2 pl-10" : "h-[w-full] w-full items-center"} relative`}
                >
                  {/* Top Logos (Always top of info section) */}
                  <div
                    className={`flex items-center gap-4 ${isHorizontal ? "w-full justify-end" : "justify-center"} mb-4 opacity-90`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Logos"
                      className={`h-12 object-contain ${isHorizontal ? "" : "mx-auto"}`}
                      crossOrigin="anonymous"
                      src="/images/all_logo.png"
                    />
                  </div>

                  {/* Title */}
                  <div
                    className={`${isHorizontal ? "mt-2 text-left" : "text-center"} w-full`}
                  >
                    <div className="mb-2 inline-block font-black text-[#ea580c] text-xs uppercase tracking-widest">
                      {t("clubName")}
                    </div>
                    <h2
                      className={`font-black text-slate-800 uppercase leading-none tracking-tight ${isHorizontal ? "text-2xl" : "mb-4 text-2xl"}`}
                    >
                      {t("cardTitle")}
                    </h2>
                  </div>

                  {/* Avatar wrapper (Only show here if VERTICAL) */}
                  {!isHorizontal && (
                    <div className="relative my-4">
                      <div className="relative z-10 mx-auto h-48 w-48 overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-[0_10px_30px_rgba(234,88,12,0.15)]">
                        {data.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt="Avatar"
                            className="h-full w-full object-cover"
                            crossOrigin="anonymous"
                            src={data.avatar}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-black text-5xl text-slate-300 uppercase">
                            {data.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  <div
                    className={`${isHorizontal ? "mb-4 text-left" : "my-4 text-center"} w-full`}
                  >
                    <h3
                      className={`font-black text-[#ea580c] uppercase ${isHorizontal ? "mt-4" : ""} leading-none ${isHorizontal ? "text-5xl" : "text-5xl"} leading-[1.1] drop-shadow-sm`}
                    >
                      {locale === "vi" ? data.lastName : data.firstName}
                      <span className="block">
                        {locale === "vi" ? data.firstName : data.lastName}
                      </span>
                    </h3>
                  </div>

                  {/* Info table */}
                  <div
                    className={`mt-3 w-full space-y-3 ${isHorizontal ? "max-w-md" : "max-w-sm"} ${isHorizontal ? "" : "mx-auto"}`}
                  >
                    <div className="flex flex-col border-orange-500/20 border-b pb-2">
                      <span className="mb-1 font-black text-[#ea580c] text-[10px] uppercase leading-none tracking-widest">
                        {t("faculty")}
                      </span>
                      <span className="font-bold text-lg text-slate-800 leading-none">
                        {t("IT")}
                      </span>
                    </div>

                    <div className="flex w-full justify-between gap-4">
                      <div className="flex w-1/2 flex-col border-orange-500/20 border-b pb-2">
                        <span className="mb-1 font-black text-[#ea580c] text-[10px] uppercase leading-none tracking-widest">
                          Ngày sinh
                        </span>
                        <span className="font-bold text-lg text-slate-800 leading-none">
                          {data.dob}
                        </span>
                      </div>
                      <div className="flex w-1/2 flex-col border-orange-500/20 border-b pb-2">
                        <span className="mb-1 font-black text-[#ea580c] text-[10px] uppercase leading-none tracking-widest">
                          {t("joinedYear")}
                        </span>
                        <span className="font-bold text-lg text-slate-800 leading-none">
                          {data.joinedYear}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col border-orange-500/20 border-b pb-2">
                      <span className="mb-1 font-black text-[#ea580c] text-[10px] uppercase leading-none tracking-widest">
                        Ban thường trực
                      </span>
                      <span className="font-bold text-lg text-slate-800 leading-none">
                        {data.department}
                      </span>
                    </div>
                  </div>

                  {/* Decorative badge at bottom right */}
                  {isHorizontal && (
                    <div className="pointer-events-none absolute right-0 bottom-0 h-24 w-24 rounded-tl-[100px] border-orange-500/20 border-t-2 border-l-2 bg-orange-500/10" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======== BACK CARD ======== */}
        <div
          className="flex w-full justify-center transition-all duration-300"
          style={{ height: cardHeight * scale }}
        >
          <div
            className="relative shrink-0 origin-top overflow-hidden rounded-[32px] border border-slate-700/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-transform duration-300"
            style={{
              width: cardWidth,
              height: cardHeight,
              transform: `scale(${scale})`,
            }}
          >
            {/* The element we actually capture */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-slate-950"
              ref={backRef}
            >
              {/* High-tech pattern background */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-screen"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 100% 150%, #ea580c 24%, white 24%, white 28%, #ea580c 28%, #ea580c 36%, white 36%, white 40%, transparent 40%, transparent),
                    radial-gradient(circle at 0    150%, #ea580c 24%, white 24%, white 28%, #ea580c 28%, #ea580c 36%, white 36%, white 40%, transparent 40%, transparent),
                    radial-gradient(circle at 50%  100%, white 10%, #ea580c 10%, #ea580c 23%, transparent 23%, transparent)
                  `,
                  backgroundSize: "100px 50px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-950 to-orange-950/40" />
              {/* Club logo watermark */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="pointer-events-none absolute top-1/2 left-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rotate-12 object-contain opacity-[0.05]"
                crossOrigin="anonymous"
                src="/images/logo.png"
              />

              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-8">
                {/* Magnetic stripe simulation on back (only for horizontal) */}
                {isHorizontal && (
                  <div className="absolute top-12 left-0 h-16 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-inner" />
                )}
                {/* If vertical, put it at the top */}
                {!isHorizontal && (
                  <div className="absolute top-0 right-12 h-full w-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-inner" />
                )}

                <div
                  className={`flex flex-col items-center justify-center ${isHorizontal ? "mt-8" : "mr-8"} gap-8`}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="pointer-events-none absolute h-[200px] w-[200px] rounded-full bg-orange-500/50 blur-[50px]" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="MPC Logo"
                      className="relative z-10 h-auto w-48 drop-shadow-2xl"
                      crossOrigin="anonymous"
                      src="/images/logo.png"
                    />
                  </div>

                  <div className="space-y-4 text-center">
                    <h2 className="font-black text-4xl text-orange-500 uppercase tracking-[0.25em] drop-shadow-md">
                      Mobile Programing
                      <span className="block text-white">Club</span>
                    </h2>

                    <div className="mx-auto h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

                    <div className="mt-6 space-y-1">
                      <p className="font-mono text-slate-400 text-xs tracking-widest">
                        EST. 2015
                      </p>
                      <p className="mx-auto mt-4 max-w-[280px] text-[10px] text-slate-500 uppercase tracking-wider">
                        If found, please return to:
                        <br />
                        Faculty of Information Technology
                        <br />
                        Ho Chi Minh City Open University
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
