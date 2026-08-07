"use client";

import { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import type { SortOptionItem } from "./SortList";

export interface DesktopSortDropdownProps {
  options: SortOptionItem[];
  activeSort: string;
  onSelectSort: (value: string) => void;
}

export const DesktopSortDropdown = memo(function DesktopSortDropdown({
  options,
  activeSort,
  onSelectSort,
}: DesktopSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active label
  const activeLabel =
    options.find((opt) => opt.value === activeSort)?.label ?? "Featured";

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (value: string) => {
    onSelectSort(value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger Button with Micro-Animation */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.96 }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Sort by: ${activeLabel}`}
        className={`inline-flex h-11 items-center justify-between gap-3 rounded-full border border-black/10 bg-black/4 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] transition-all duration-200 hover:border-black/20 hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer select-none ${
          isOpen ? "border-black/30 bg-black/8 ring-1 ring-black/10" : ""
        }`}
      >
        <span>{activeLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#666666] transition-transform duration-250 ${
            isOpen ? "rotate-180 text-black" : ""
          }`}
        />
      </motion.button>

      {/* Animated Custom Luxury Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{
              duration: 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            role="listbox"
            aria-label="Sort options menu"
            className="absolute right-0 top-full mt-2.5 z-40 flex min-w-[220px] flex-col gap-1 rounded-2xl border border-black/8 bg-[#faf9f6] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl focus:outline-none"
          >
            {options.map((option) => {
              const isSelected = activeSort === option.value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  whileTap={{ scale: 0.97 }}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-150 cursor-pointer select-none ${
                    isSelected
                      ? "bg-[#111111] text-white font-semibold shadow-xs"
                      : "text-[#333333] hover:bg-black/5 hover:text-[#111111]"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-white stroke-[2.5] ml-2" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
