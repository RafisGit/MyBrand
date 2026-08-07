"use client";

import { useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const BottomSheet = memo(function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  // Lock body scroll when open and listen for Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex flex-col justify-end"
        >
          {/* Fade Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 32,
              stiffness: 380,
              mass: 0.8,
            }}
            className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-[1.8rem] border-t border-black/8 bg-[#faf9f6] text-[#111111] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] focus:outline-none"
          >
            {/* Top Grab Handle */}
            <div className="flex w-full justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-black/15" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/6 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#111111] sm:text-lg">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-0.5 text-xs text-[#777777]">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.94 }}
                aria-label="Close sheet"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-[#555555] transition hover:bg-black/10 hover:text-black cursor-pointer"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Sheet Body Content */}
            <div className="overflow-y-auto px-4 py-4 max-h-[60vh] overscroll-contain">
              {children}
            </div>

            {/* Bottom Safe Area Padding */}
            <div className="pb-8 pt-1" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
