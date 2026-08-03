import type { Product } from "@/types";
import { toSlug } from "@/lib/utils/slug";

export type CollectionFilter = string;

export type ProductDisplayMeta = {
  accent: string;
  badge: string;
  categoryLabel: string;
  filters: CollectionFilter[];
  images: [string, string];
  mood: string;
  priority: number;
};

const fallbackImage =
  "https://images.pexels.com/photos/4862951/pexels-photo-4862951.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4862951.jpg&fm=jpg";

function isNewArrival(product: Product) {
  const createdAt = new Date(product.createdAt).getTime();

  if (Number.isNaN(createdAt)) {
    return false;
  }

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt <= thirtyDays;
}

export function buildStorefrontDisplayMeta(
  product: Product,
  priority: number,
): ProductDisplayMeta {
  const filters: CollectionFilter[] = ["all"];

  // Exact slug from category
  if (product.category) {
    filters.push(toSlug(product.category));
  }

  // Exact slug from collection (may differ from category)
  if (product.collection && product.collection !== product.category) {
    filters.push(toSlug(product.collection));
  }

  // Virtual label filters
  if (product.bestSeller || product.featured) {
    filters.push("best-sellers");
  }

  if (product.newArrival || isNewArrival(product)) {
    filters.push("new-arrivals");
  }

  if (product.trending) {
    filters.push("trending");
  }

  if (product.onSale) {
    filters.push("on-sale");
  }

  if (product.limitedEdition) {
    filters.push("limited-edition");
  }

  if (product.recommended) {
    filters.push("recommended");
  }

  const primaryImage = product.images[0] ?? fallbackImage;
  const secondaryImage = product.images[1] ?? primaryImage;

  return {
    accent: product.shortDescription,
    badge: product.featured
      ? "Featured Piece"
      : product.bestSeller
        ? "Best Seller"
        : "Collection Edit",
    categoryLabel: product.collection,
    filters: Array.from(new Set(filters)),
    images: [primaryImage, secondaryImage],
    mood: product.category,
    priority,
  };
}
