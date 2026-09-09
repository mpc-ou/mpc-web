"use client";

import { Center, ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function ShirtModel() {
  const { scene } = useGLTF("/models/AoCLB.glb");
  return <primitive object={scene} />;
}

export function ClubShirtModelClient() {
  const t = useTranslations("clubUniform");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(2.5);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        setScale(window.innerWidth < 768 ? 2.5 : 3.5);
      } else {
        setScale(window.innerWidth < 768 ? 3 : 3.5);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFullscreen]);

  return (
    <section className='relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden border-border border-y bg-muted/5'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent' />

      <div className='container relative z-10 mx-auto px-4 py-20 lg:py-32'>
        <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16'>
          <div className='flex flex-col justify-center text-center lg:text-left'>
            <div className='mb-6 flex justify-center lg:justify-start'>
              <span className='inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm'>
                {t("badge")}
              </span>
            </div>
            <h2 className='text-balance font-black text-4xl tracking-tight sm:text-5xl lg:text-6xl'>{t("title")}</h2>
            <p className='mt-6 break-words text-lg text-muted-foreground sm:text-xl'>{t("description")}</p>
          </div>

          {/* biome-ignore lint/a11y/noStaticElementInteractions: 3D Canvas wrapper requires mouse gestures for rotation */}
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: 3D Canvas wrapper requires double click gesture */}
          <div
            className={cn(
              "group relative cursor-grab select-none transition-all duration-300 active:cursor-grabbing",
              isFullscreen
                ? "fixed inset-0 z-[9999] flex h-screen w-screen flex-col items-center justify-center bg-black/95 p-6"
                : "relative aspect-square w-full lg:aspect-auto lg:h-[800px]"
            )}
            onDoubleClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Nhấp đúp chuột để thu nhỏ" : "Nhấp đúp chuột để phóng to"}
          >
            {isFullscreen && (
              <div className='pointer-events-none absolute top-6 left-6 z-20'>
                <h3 className='font-bold font-mono text-white text-xl uppercase tracking-wider'>{t("title")}</h3>
                <p className='mt-1 text-xs text-zinc-400'>Nhấn đúp chuột hoặc ESC để quay lại</p>
              </div>
            )}

            <div className='pointer-events-none absolute bottom-4 left-4 z-20 opacity-60 transition-opacity duration-300 group-hover:opacity-100'>
              <p className='rounded-lg bg-black/55 px-2.5 py-1 text-xs text-zinc-300 backdrop-blur-xs'>
                {isFullscreen
                  ? "💡 Nhấp đúp chuột để thu nhỏ • Kéo để xoay • Lăn chuột để zoom"
                  : "💡 Nhấp đúp chuột để xem toàn màn hình • Lăn để zoom"}
              </p>
            </div>

            <div className='h-full w-full'>
              <Suspense
                fallback={
                  <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='animate-pulse font-medium text-sm'>Đang tải mô hình 3D...</p>
                  </div>
                }
              >
                <Canvas camera={{ position: [0, 0, 8], fov: 40 }} className='h-full w-full'>
                  <ambientLight intensity={0.6} />
                  <directionalLight intensity={1.2} position={[10, 10, 10]} />
                  <Environment preset='city' />
                  <Center>
                    <group position={[0, -0.2, 0]} scale={scale}>
                      <ShirtModel />
                    </group>
                  </Center>
                  <OrbitControls
                    autoRotate={!isFullscreen}
                    autoRotateSpeed={1.5}
                    enablePan={isFullscreen}
                    enableZoom={isFullscreen}
                    maxDistance={15}
                    maxPolarAngle={Math.PI}
                    minDistance={3}
                    minPolarAngle={0}
                  />
                  <ContactShadows blur={2.5} far={4} opacity={0.4} position={[0, -2.2, 0]} scale={10} />
                </Canvas>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload("/models/AoCLB.glb");
