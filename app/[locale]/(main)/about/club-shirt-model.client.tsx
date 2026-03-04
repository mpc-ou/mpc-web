"use client";

import {
  OrbitControls,
  useGLTF,
  Environment,
  Center,
  ContactShadows,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

function ShirtModel() {
  const { scene } = useGLTF("/models/AoCLB.glb");
  return <primitive object={scene} />;
}

export function ClubShirtModelClient() {
  const t = useTranslations("clubUniform");

  return (
    <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden bg-muted/5 border-y border-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div className="flex flex-col justify-center text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
                {t("badge")}
              </span>
            </div>
            <h2 className="text-balance font-black text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-balance text-lg text-muted-foreground sm:text-xl">
              {t("description")}
            </p>
          </div>

          <div className="relative aspect-square w-full lg:aspect-auto lg:h-[800px] cursor-grab active:cursor-grabbing">
            <Suspense
              fallback={
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium animate-pulse">
                    Đang tải mô hình 3D...
                  </p>
                </div>
              }
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <Environment preset="city" />
                <Center>
                  <group position={[0, -0.5, 0]} scale={2.0}>
                    <ShirtModel />
                  </group>
                </Center>
                <OrbitControls
                  autoRotate
                  autoRotateSpeed={2}
                  enablePan={false}
                  enableZoom={true}
                  minDistance={3}
                  maxDistance={15}
                  minPolarAngle={Math.PI / 2}
                  maxPolarAngle={Math.PI / 2}
                />
                <ContactShadows
                  position={[0, -2, 0]}
                  opacity={0.4}
                  scale={10}
                  blur={2}
                  far={4}
                />
              </Canvas>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

// Preload the model
useGLTF.preload("/models/AoCLB.glb");
