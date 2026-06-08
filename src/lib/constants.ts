import type { CategoryHighlight, ProductCategory } from "@/types";

import { publicEnv } from "@/lib/env";

export const siteConfig = {
  name: "VALTORN",
  description:
    "A premium menswear storefront shaped by cinematic product lighting, oversized essentials, and quiet luxury streetwear.",
  url: publicEnv.siteUrl,
  instagram: "https://instagram.com",
  pinterest: "https://pinterest.com",
  tiktok: "https://tiktok.com",
};

export const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collection" },
];

export const catalogCategories: ProductCategory[] = [
  "Menswear",
  "Womenswear",
  "Thobes",
  "Panjabi",
  "Sherwani",
  "Streetwear",
];

export const categoryHighlights: CategoryHighlight[] = [
  {
    name: "Menswear",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    description: "Quiet tailoring, sculpted seams, and matte tonal layering.",
  },
  {
    name: "Womenswear",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    description: "Sleek silhouettes, soft structure, and editorial surface textures.",
  },
  {
    name: "Thobes",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    description: "Modern drape, sculptural ease, and refined monochrome presence.",
  },
  {
    name: "Panjabi",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    description: "Crisp finishes, elevated contrast, and premium textile details.",
  },
  {
    name: "Sherwani",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    description: "Architectural tailoring and ceremonial luxury without excess.",
  },
  {
    name: "Streetwear",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    description: "Subtle attitude, premium basics, and sculpted everyday movement.",
  },
];

export const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/products?sort=latest" },
      { label: "Best Sellers", href: "/products?sort=popular" },
      { label: "Oversized Fits", href: "/products?category=Oversized" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping", href: "/checkout" },
      { label: "Returns", href: "/auth/login" },
      { label: "Contact", href: "mailto:studio@valtorn.com" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Brand Story", href: "/#story" },
      { label: "Collection", href: "/products" },
      { label: "Customer Login", href: "/auth/login" },
    ],
  },
];

export const sizeScale = ["XS", "S", "M", "L", "XL"];

export const colorScale = [
  "Black",
  "Bone",
  "Stone",
  "Sand",
  "Olive",
  "Charcoal",
  "Taupe",
];
