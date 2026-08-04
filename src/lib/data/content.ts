import type { DashboardMetric, EditorialFeature, SocialImage } from "@/types";

export const heroContent = {
  eyebrow: "Art Direction",
  title: "A premium fashion experience with the product at the center.",
  body:
    "Presenting garments as sculptural objects, luminous visuals, and minimal editorial compositions for a luxury online showroom.",
  primaryCta: { href: "/products", label: "Explore Collection" },
  secondaryCta: { href: "/products?sort=latest", label: "New Arrivals" },
  image:
    "https://images.unsplash.com/photo-1626457289201-f6c32cb9bb42?auto=format&fit=crop&w=1800&q=80",
};

export const campaignBanners = [
  {
    id: "campaign_eid",
    title: "Eid Light Edit",
    subtitle: "Soft minimal tailoring for a refined wardrobe narrative.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80",
    cta: { href: "/products?sort=latest", label: "View Edit" },
  },
  {
    id: "campaign_linen",
    title: "Premium Linen Collection",
    subtitle: "Breathable, muted tones and premium finishings for elevated daywear.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80",
    cta: { href: "/products?category=Thobes", label: "See Campaign" },
  },
  {
    id: "campaign_winter",
    title: "Winter Essentials",
    subtitle: "Monochrome layers, tactile fabrics, and curated product-driven visuals.",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1600&q=80",
    cta: { href: "/products?category=Menswear", label: "Shop Winter" },
  },
];

export const editorialFeatures: EditorialFeature[] = [
  {
    title: "Editorial restraint",
    body:
      "Large typography, quiet palettes, and controlled motion keep the interface focused on product presence.",
  },
  {
    title: "Luxurious materiality",
    body:
      "Each section is composed like a fashion campaign, using texture, shadow, and proportion to elevate the narrative.",
  },
  {
    title: "Product-led commerce",
    body:
      "The experience is built around premium imagery, smooth motion, and clean commerce flows that feel polished and deliberate.",
  },
];

export const socialGallery: SocialImage[] = [
  {
    id: "social_001",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    title: "Studio layer",
  },
  {
    id: "social_002",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    title: "Soft tailoring",
  },
  {
    id: "social_003",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    title: "Quiet statement",
  },
  {
    id: "social_004",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    title: "After-hours edit",
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Revenue", value: "৳42.8K", change: "+18.4%" },
  { label: "Orders", value: "312", change: "+9.2%" },
  { label: "AOV", value: "৳1,850", change: "+5.1%" },
];
