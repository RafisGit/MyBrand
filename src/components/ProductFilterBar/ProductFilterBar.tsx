"use client";

import { useState, useMemo, useCallback } from "react";
import { FilterChip } from "./FilterChip";
import { FilterButton } from "./FilterButton";
import { CategorySheet, type CategoryOption } from "./CategorySheet";
import { SortSheet, type SortOptionItem } from "./SortSheet";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export interface ProductFilterBarProps {
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

export function ProductFilterBar({
  categories,
  activeCategory,
  onSelectCategory,
  sortOptions,
  activeSort,
  onSelectSort,
  className = "",
  scrollTargetId = "collection-grid",
}: ProductFilterBarProps) {
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  // Top visible categories for mobile Row 1 (top 2 categories + ALL + +More = 4 pills total)
  const topMobileCategories = useMemo(() => categories.slice(0, 2), [categories]);

  // Check if active category is inside the hidden "+ More" set
  const isActiveCategoryHidden = useMemo(() => {
    if (activeCategory === "all") return false;
    return !topMobileCategories.some((cat) => cat.value === activeCategory);
  }, [activeCategory, topMobileCategories]);

  // Find active label for display
  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === "all") return "All Pieces";
    const found = categories.find((c) => c.value === activeCategory);
    return found ? found.label : "All Pieces";
  }, [activeCategory, categories]);

  const activeSortLabel = useMemo(() => {
    const found = sortOptions.find((s) => s.value === activeSort);
    return found ? found.label : "Featured";
  }, [activeSort, sortOptions]);

  // Auto-scroll handler
  const handleScrollToGrid = useCallback(() => {
    if (!scrollTargetId) return;
    const element = document.getElementById(scrollTargetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Offset for sticky header
      const targetY = rect.top + scrollTop - 90;
      if (rect.top < 0 || rect.top > 400) {
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      }
    }
  }, [scrollTargetId]);

  const handleCategorySelect = useCallback(
    (value: string) => {
      onSelectCategory(value);
      handleScrollToGrid();
    },
    [onSelectCategory, handleScrollToGrid]
  );

  const handleSortSelect = useCallback(
    (value: string) => {
      onSelectSort(value);
      handleScrollToGrid();
    },
    [onSelectSort, handleScrollToGrid]
  );

  return (
    <>
      <div
        className={`sticky top-20 z-20 rounded-[1.8rem] border border-white/10 bg-[#0d0d0d]/95 p-3 shadow-[0_30px_110px_-70px_rgba(0,0,0,1)] backdrop-blur-xl transition-all duration-300 ${className}`}
      >
        {/* =========================================================================
            MOBILE LAYOUT (< md): Compact Two-Level Filter System
           ========================================================================= */}
        <div className="flex flex-col gap-2.5 md:hidden">
          {/* First Row: Compact Pills (ALL, Top items, + More) */}
          <div className="grid grid-cols-4 gap-2 w-full">
            {/* ALL Pill */}
            <FilterChip
              label="ALL"
              value="all"
              isActive={activeCategory === "all"}
              onClick={() => handleCategorySelect("all")}
              className="w-full min-h-[44px] px-2 text-[11px]"
            />

            {/* Top Categories */}
            {topMobileCategories.map((cat) => (
              <FilterChip
                key={cat.value}
                label={cat.label}
                value={cat.value}
                isActive={activeCategory === cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className="w-full min-h-[44px] px-2 text-[11px]"
              />
            ))}

            {/* + More Pill */}
            <FilterChip
              label={
                isActiveCategoryHidden
                  ? activeCategoryLabel.length > 8
                    ? `${activeCategoryLabel.slice(0, 7)}...`
                    : activeCategoryLabel
                  : "+ More"
              }
              value="more"
              isActive={isActiveCategoryHidden}
              onClick={() => setIsCategorySheetOpen(true)}
              icon={
                isActiveCategoryHidden ? undefined : (
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
                )
              }
              className="w-full min-h-[44px] px-2 text-[11px]"
            />
          </div>

          {/* Second Row: Two Equal Buttons (Category ▼ | Sort ▼) */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <FilterButton
              label="Category"
              value={activeCategoryLabel}
              onClick={() => setIsCategorySheetOpen(true)}
              isOpen={isCategorySheetOpen}
              icon={<SlidersHorizontal className="h-3.5 w-3.5 text-[#ccb79d]" />}
            />
            <FilterButton
              label="Sort"
              value={activeSortLabel}
              onClick={() => setIsSortSheetOpen(true)}
              isOpen={isSortSheetOpen}
            />
          </div>
        </div>

        {/* =========================================================================
            DESKTOP / TABLET HYBRID LAYOUT (>= md)
           ========================================================================= */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
          {/* Horizontal category pills wrapper */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="All Pieces"
              value="all"
              isActive={activeCategory === "all"}
              onClick={() => handleCategorySelect("all")}
            />
            {categories.map((cat) => (
              <FilterChip
                key={cat.value}
                label={cat.label}
                value={cat.value}
                isActive={activeCategory === cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                count={cat.count}
              />
            ))}
          </div>

          {/* Desktop Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={activeSort}
              onChange={(e) => handleSortSelect(e.target.value)}
              aria-label="Sort options"
              className="h-11 rounded-full border border-white/12 bg-white/[0.04] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5efe7] outline-none transition hover:border-white/20 hover:bg-white/[0.08] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#f5efe7]"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-[#101010] text-[#f5efe7]"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SHEETS
         ========================================================================= */}
      <CategorySheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
      />

      <SortSheet
        isOpen={isSortSheetOpen}
        onClose={() => setIsSortSheetOpen(false)}
        options={sortOptions}
        activeSort={activeSort}
        onSelectSort={handleSortSelect}
      />
    </>
  );
}
