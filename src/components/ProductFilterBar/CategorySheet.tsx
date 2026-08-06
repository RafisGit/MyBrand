"use client";

import { useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

export interface CategoryOption {
  label: string;
  value: string;
  count?: number;
}

export interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  activeCategory: string;
  onSelectCategory: (categoryValue: string) => void;
}

export const CategorySheet = memo(function CategorySheet({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
}: CategorySheetProps) {
  // Prevent background scrolling when sheet is open & listen for Escape key
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

  const handleSelect = (value: string) => {
    onSelectCategory(value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose Collection"
          className="fixed inset-0 z-50 flex flex-col justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 350,
              restDelta: 0.01,
            }}
            className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-[2.2rem] border-t border-white/12 bg-[#101010] text-[#f5efe7] shadow-[0_-25px_80px_rgba(0,0,0,0.9)] focus:outline-none"
          >
            {/* Top Grab Handle */}
            <div className="flex w-full justify-center pt-3 pb-1">
              <div className="h-1 w-12 rounded-full bg-white/20" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-[#f5efe7] sm:text-lg">
                  Choose Collection
                </h2>
                <p className="mt-0.5 text-xs text-[#827b70]">
                  Select a category to filter pieces
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close bottom sheet"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-[#b0a99d] transition hover:bg-white/[0.12] hover:text-white active:scale-95 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Categories List */}
            <div className="overflow-y-auto px-4 py-3 space-y-1.5 max-h-[60vh] overscroll-contain">
              {/* All Pieces option */}
              <button
                type="button"
                onClick={() => handleSelect("all")}
                className={`flex w-full min-h-[52px] items-center justify-between rounded-2xl px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer select-none ${
                  activeCategory === "all"
                    ? "bg-[#f5efe7] text-black shadow-md"
                    : "text-[#b0a99d] hover:bg-white/[0.05] hover:text-[#f5efe7]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {activeCategory === "all" && (
                    <Check className="h-4 w-4 shrink-0 text-black stroke-[2.5]" />
                  )}
                  <span>All Pieces</span>
                </span>
                {activeCategory === "all" && (
                  <span className="text-[10px] font-bold tracking-widest text-black/60">
                    SELECTED
                  </span>
                )}
              </button>

              {categories.map((cat) => {
                const isSelected = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleSelect(cat.value)}
                    className={`flex w-full min-h-[52px] items-center justify-between rounded-2xl px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#f5efe7] text-black shadow-md"
                        : "text-[#b0a99d] hover:bg-white/[0.05] hover:text-[#f5efe7]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-black stroke-[2.5]" />
                      )}
                      <span className="truncate">{cat.label}</span>
                    </span>
                    {isSelected ? (
                      <span className="text-[10px] font-bold tracking-widest text-black/60 shrink-0">
                        SELECTED
                      </span>
                    ) : cat.count !== undefined ? (
                      <span className="text-[11px] text-[#7a7469] shrink-0">
                        {cat.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Bottom Safe Padding */}
            <div className="pb-8 pt-2" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
