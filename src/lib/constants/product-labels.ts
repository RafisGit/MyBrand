export type ProductLabelKey =
  | "featured"
  | "newArrival"
  | "bestSeller"
  | "trending"
  | "recommended"
  | "limitedEdition"
  | "onSale";

export interface ProductLabelDefinition {
  key: ProductLabelKey;
  label: string;
  description: string;
  filterKey: string; // Key used in filter pills (e.g. 'new_arrival')
  badgeClassName: string; // Tailwind classes for badge styling
  toggleColor: string; // Color classes for the toggle switch when ON
  icon?: string; // Optional icon name for future use
}

export const PRODUCT_LABELS: ProductLabelDefinition[] = [
  {
    key: "featured",
    label: "Featured",
    description: "Highlight as a featured product on the storefront.",
    filterKey: "featured",
    badgeClassName: "bg-indigo-600/30 text-indigo-200 border border-indigo-400/50",
    toggleColor: "bg-indigo-500",
  },
  {
    key: "newArrival",
    label: "New Arrival",
    description: "Mark as a fresh catalog drop.",
    filterKey: "new_arrival",
    badgeClassName: "bg-emerald-600/30 text-emerald-200 border border-emerald-400/50",
    toggleColor: "bg-emerald-500",
  },
  {
    key: "bestSeller",
    label: "Best Seller",
    description: "Tag as one of the top-selling products.",
    filterKey: "best_seller",
    badgeClassName: "bg-amber-600/30 text-amber-200 border border-amber-400/50",
    toggleColor: "bg-amber-500",
  },
  {
    key: "trending",
    label: "Trending",
    description: "Show in trending product sections.",
    filterKey: "trending",
    badgeClassName: "bg-orange-600/30 text-orange-200 border border-orange-400/50",
    toggleColor: "bg-orange-500",
  },
  {
    key: "recommended",
    label: "Recommended",
    description: "Display in curated recommendation sections.",
    filterKey: "recommended",
    badgeClassName: "bg-sky-600/30 text-sky-200 border border-sky-400/50",
    toggleColor: "bg-sky-500",
  },
  {
    key: "limitedEdition",
    label: "Limited Edition",
    description: "Flag as a limited-run exclusive item.",
    filterKey: "limited_edition",
    badgeClassName: "bg-purple-600/30 text-purple-200 border border-purple-400/50",
    toggleColor: "bg-purple-500",
  },
  {
    key: "onSale",
    label: "On Sale",
    description: "Apply sale badge and promotional visibility.",
    filterKey: "on_sale",
    badgeClassName: "bg-rose-600/30 text-rose-200 border border-rose-400/50",
    toggleColor: "bg-rose-500",
  },
];

/** Map from filterKey (used in URL/filters) back to the label definition */
export const LABEL_BY_FILTER_KEY = new Map(
  PRODUCT_LABELS.map((l) => [l.filterKey, l]),
);

/** Map from key to label definition */
export const LABEL_BY_KEY = new Map(
  PRODUCT_LABELS.map((l) => [l.key, l]),
);
