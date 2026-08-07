"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface CategoryOption {
  label: string;
  value: string;
  count?: number;
}

export interface CollectionListProps {
  categories: CategoryOption[];
  activeCategory: string;
  onSelectCategory: (value: string) => void;
}

export const CollectionList = memo(function CollectionList({
  categories,
  activeCategory,
  onSelectCategory,
}: CollectionListProps) {
  const allCategories: CategoryOption[] = [
    { label: "All Pieces", value: "all" },
    ...categories.filter((c) => c.value !== "all"),
  ];

  return (
    <div className="flex flex-col gap-2">
      {allCategories.map((cat) => {
        const isSelected = activeCategory === cat.value;

        return (
          <motion.button
            key={cat.value}
            type="button"
            onClick={() => onSelectCategory(cat.value)}
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
                {cat.label}
              </span>
            </span>

            {cat.count !== undefined && !isSelected ? (
              <span className="text-xs text-[#777777] font-normal shrink-0">
                {cat.count}
              </span>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
});
