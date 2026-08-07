"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface CollectionSelectorProps {
  activeLabel: string;
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
}

export const CollectionSelector = memo(function CollectionSelector({
  activeLabel,
  onClick,
  isOpen = false,
  className = "",
}: CollectionSelectorProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={`Selected collection: ${activeLabel}`}
      className={`flex min-h-[48px] w-full items-center justify-between gap-2.5 rounded-[14px] bg-[#f4f4f3] px-4.5 py-3 text-sm font-medium text-[#111111] transition-all duration-200 hover:bg-[#eae9e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer select-none ${
        isOpen ? "bg-[#eae9e5] ring-1 ring-black/10" : ""
      } ${className}`}
    >
      <span className="truncate font-medium tracking-tight text-[#111111]">
        {activeLabel}
      </span>
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-[#666666] transition-transform duration-200 ${
          isOpen ? "rotate-180 text-black" : ""
        }`}
      />
    </motion.button>
  );
});
