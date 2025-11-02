"use client";

import { motion } from "framer-motion";

export function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[var(--text-secondary)]"
        >
          Đang tải...
        </motion.p>
      </div>
    </div>
  );
}
