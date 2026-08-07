"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface SortOptionItem {
  label: string;
  value: string;
}

export interface SortListProps {
  options: SortOptionItem[];
  activeSort: string;
  onSelectSort: (value: string) => void;
}

export const SortList = memo(function SortList({
  options,
  activeSort,
  onSelectSort,
}: SortListProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const isSelected = activeSort === option.value;

        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onSelectSort(option.value)}
            whileTap={{ scale: 0.98 }}
            className={`flex min-h-[52px] w-full items-center justify-between rounded-xl px-5 py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
              isSelected
                ? "bg-[#111111] text-white shadow-sm"
                : "bg-[#f4f4f3] text-[#222222] hover:bg-[#eae9e5]"
            }`}
          >
            <span className="flex items-center gap-3 truncate">
              {isSelected ? (
                <Check className="h-4 w-4 shrink-0 text-white stroke-[2.5]" />
              ) : null}
              <span className={`truncate ${isSelected ? "font-semibold" : ""}`}>
                {option.label}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
});
