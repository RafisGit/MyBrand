"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface FilterButtonProps {
  label: string;
  value?: string;
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const FilterButton = memo(function FilterButton({
  label,
  value,
  onClick,
  isOpen = false,
  className = "",
  icon,
}: FilterButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={`${label}${value ? `: ${value}` : ""}`}
      className={`flex min-h-[48px] w-full items-center justify-between gap-2.5 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5efe7] shadow-sm transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5efe7] focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer select-none ${
        isOpen ? "border-white/30 bg-white/[0.1] text-white" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-2 truncate">
        {icon}
        <span className="text-[#827b70]">{label}</span>
        {value ? (
          <span className="truncate font-bold text-[#f5efe7]">{value}</span>
        ) : null}
      </div>
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-[#a59d90] transition-transform duration-250 ${
          isOpen ? "rotate-180 text-[#f5efe7]" : ""
        }`}
      />
    </motion.button>
  );
});
