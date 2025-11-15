"use client";

import { useState, useEffect } from "react";
import { X, Bell, AlertCircle, Info, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ALERT_CONFIG } from "@/lib/config";

interface AlertBannerProps {
  className?: string;
}

export function AlertBanner({ className }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (!ALERT_CONFIG.enabled) {
      document.documentElement.style.setProperty("--alert-banner-height", "0px");
      return;
    }

    // Kiểm tra xem đã bị đóng tạm thời chưa (sessionStorage)
    const dismissedTemporarily = sessionStorage.getItem(
      `alert-closed-${ALERT_CONFIG.id}`
    );
    if (dismissedTemporarily === "true") {
      setIsClosed(true);
      setIsVisible(false);
      document.documentElement.style.setProperty("--alert-banner-height", "0px");
      return;
    }

    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Tính toán height của alert banner và set CSS variable
      const updateHeight = () => {
        const banner = document.querySelector('[data-alert-banner]');
        if (banner) {
          const height = banner.getBoundingClientRect().height;
          document.documentElement.style.setProperty("--alert-banner-height", `${height}px`);
        }
      };
      
      // Update height sau khi render
      setTimeout(updateHeight, 100);
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }
  }, [isVisible]);

  const handleClose = () => {
    // Đóng tạm thời - chỉ trong session này
    sessionStorage.setItem(`alert-closed-${ALERT_CONFIG.id}`, "true");
    setIsClosed(true);
    setIsVisible(false);
    document.documentElement.style.setProperty("--alert-banner-height", "0px");
  };

  if (!ALERT_CONFIG.enabled || !isVisible || isClosed) {
    return null;
  }

  const IconComponent =
    ALERT_CONFIG.type === "info"
      ? Info
      : ALERT_CONFIG.type === "success"
      ? CheckCircle
      : ALERT_CONFIG.type === "warning"
      ? AlertCircle
      : Bell;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          data-alert-banner
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[100] border-b",
            ALERT_CONFIG.type === "info" && "bg-[var(--info-light)] border-[var(--info)]",
            ALERT_CONFIG.type === "success" && "bg-[var(--success-light)] border-[var(--success)]",
            ALERT_CONFIG.type === "warning" && "bg-[var(--warning-light)] border-[var(--warning)]",
            ALERT_CONFIG.type === "error" && "bg-[var(--error-light)] border-[var(--error)]",
            !ALERT_CONFIG.type && "bg-[var(--primary-light)] border-[var(--primary)]",
            className
          )}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <IconComponent
                className={cn(
                  "h-5 w-5 shrink-0",
                  ALERT_CONFIG.type === "info" && "text-[var(--info)]",
                  ALERT_CONFIG.type === "success" && "text-[var(--success)]",
                  ALERT_CONFIG.type === "warning" && "text-[var(--warning)]",
                  ALERT_CONFIG.type === "error" && "text-[var(--error)]",
                  !ALERT_CONFIG.type && "text-[var(--primary)]"
                )}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium text-[var(--text-primary)]">
                  {ALERT_CONFIG.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {ALERT_CONFIG.link && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    asChild
                  >
                    <a
                      href={ALERT_CONFIG.link.url}
                      target={ALERT_CONFIG.link.openInNewTab ? "_blank" : "_self"}
                      rel={ALERT_CONFIG.link.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {ALERT_CONFIG.link.label}
                      {ALERT_CONFIG.link.openInNewTab && (
                        <ExternalLink className="ml-1 h-3 w-3" />
                      )}
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleClose}
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

