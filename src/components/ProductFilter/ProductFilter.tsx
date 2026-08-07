"use client";

import { useState, useMemo, useCallback } from "react";
import { CollectionSelector } from "./CollectionSelector";
import { SortSelector } from "./SortSelector";
import { BottomSheet } from "./BottomSheet";
import { CollectionList, type CategoryOption } from "./CollectionList";
import { SortList, type SortOptionItem } from "./SortList";
import { DesktopSortDropdown } from "./DesktopSortDropdown";
import { motion } from "framer-motion";

export interface ProductFilterProps {
  categories: CategoryOption[];
  activeCategory: string;
  onSelectCategory: (value: string) => void;
  sortOptions: SortOptionItem[];
  activeSort: string;
  onSelectSort: (value: string) => void;
  className?: string;
  /** Optional ID of container to scroll into view upon selecting a filter */
  scrollTargetId?: string;
}

export function ProductFilter({
  categories,
  activeCategory,
  onSelectCategory,
  sortOptions,
  activeSort,
  onSelectSort,
  className = "",
  scrollTargetId = "collection-grid",
}: ProductFilterProps) {
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  // Active collection label for single-row button
  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === "all") return "All Pieces";
    const found = categories.find((c) => c.value === activeCategory);
    return found ? found.label : "All Pieces";
  }, [activeCategory, categories]);

  // Active sort label for single-row button
  const activeSortLabel = useMemo(() => {
    const found = sortOptions.find((s) => s.value === activeSort);
    return found ? found.label : "Featured";
  }, [activeSort, sortOptions]);

  // Auto-scroll to products grid top
  const handleScrollToGrid = useCallback(() => {
    if (!scrollTargetId) return;
    const element = document.getElementById(scrollTargetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - 90;
      if (rect.top < 0 || rect.top > 400) {
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      }
    }
  }, [scrollTargetId]);

  const handleCategorySelect = useCallback(
    (value: string) => {
      onSelectCategory(value);
      setIsCategorySheetOpen(false);
      handleScrollToGrid();
    },
    [onSelectCategory, handleScrollToGrid]
  );

  const handleSortSelect = useCallback(
    (value: string) => {
      onSelectSort(value);
      setIsSortSheetOpen(false);
      handleScrollToGrid();
    },
    [onSelectSort, handleScrollToGrid]
  );

  return (
    <>
      <div
        className={`sticky top-[calc(var(--header-height,72px)+12px)] z-20 rounded-2xl border border-black/6 bg-[#faf9f6]/95 p-2.5 sm:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-300 ${className}`}
      >
        {/* =========================================================================
            MOBILE LAYOUT (< md): Redesigned Minimal 1-Row Selector System
           ========================================================================= */}
        <div className="grid grid-cols-2 gap-2.5 w-full md:hidden">
          <CollectionSelector
            activeLabel={activeCategoryLabel}
            onClick={() => setIsCategorySheetOpen(true)}
            isOpen={isCategorySheetOpen}
          />
          <SortSelector
            activeLabel={activeSortLabel}
            onClick={() => setIsSortSheetOpen(true)}
            isOpen={isSortSheetOpen}
          />
        </div>

        {/* =========================================================================
            DESKTOP LAYOUT (>= md): Editorial Pill System & Animated Custom Sort Dropdown
           ========================================================================= */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
          {/* Horizontal category pills wrapper */}
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategorySelect("all")}
              aria-pressed={activeCategory === "all"}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer select-none ${
                activeCategory === "all"
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-black/4 text-[#555555] hover:bg-black/8 hover:text-[#111111]"
              }`}
            >
              All Pieces
            </motion.button>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <motion.button
                  key={cat.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategorySelect(cat.value)}
                  aria-pressed={isActive}
                  className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? "bg-[#111111] text-white shadow-xs"
                      : "bg-black/4 text-[#555555] hover:bg-black/8 hover:text-[#111111]"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count !== undefined ? (
                    <span
                      className={`text-[10px] ${
                        isActive ? "text-white/70" : "text-[#888888]"
                      }`}
                    >
                      ({cat.count})
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>

          {/* Desktop Custom Animated Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <DesktopSortDropdown
              options={sortOptions}
              activeSort={activeSort}
              onSelectSort={handleSortSelect}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SHEETS
         ========================================================================= */}
      <BottomSheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        title="Choose Collection"
        subtitle="Select a category to filter pieces"
      >
        <CollectionList
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        title="Sort Collection"
        subtitle="Choose how to organize pieces"
      >
        <SortList
          options={sortOptions}
          activeSort={activeSort}
          onSelectSort={handleSortSelect}
        />
      </BottomSheet>
    </>
  );
}
