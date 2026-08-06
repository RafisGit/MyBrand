"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export interface FilterChipProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
  count?: number;
}

export const FilterChip = memo(function FilterChip({
  label,
  isActive,
  onClick,
  icon,
  className = "",
  count,
}: FilterChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      aria-pressed={isActive}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5efe7] focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer select-none ${
        isActive
          ? "bg-[#f5efe7] text-black shadow-sm"
          : "border border-white/12 bg-white/[0.04] text-[#b0a99d] hover:border-white/20 hover:bg-white/[0.08] hover:text-[#f5efe7]"
      } ${className}`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] ${
            isActive ? "text-black/60" : "text-[#7a7469]"
          }`}
        >
          ({count})
        </span>
      )}
      {icon}
    </motion.button>
  );
});
