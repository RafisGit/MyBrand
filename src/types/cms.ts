export interface HomepageSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  images: Record<string, string>;
  config: Record<string, unknown>;
  visibility: boolean;
  displayOrder: number;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HeroCard {
  id: string;
  sectionId?: string;
  title: string;
  subtitle?: string | null;
  tag?: string | null;
  imageUrl: string;
  link?: string | null;
  displayOrder: number;
  status: "draft" | "published";
}

export interface BannerAsset {
  id: string;
  bannerType: "hero" | "promotional" | "lifestyle" | "footer" | "popup";
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  visibility: boolean;
  displayOrder: number;
  status: "draft" | "published";
}

export interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  publicUrl: string;
  filename: string;
  folder: string;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  altText?: string | null;
  caption?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  collectionCover?: string | null;
  collectionBanner?: string | null;
  isFeatured: boolean;
  isHomepage: boolean;
  isLanding: boolean;
  displayOrder: number;
  visibility: boolean;
  status: "draft" | "published" | "archived";
  publishedAt?: string | null;
  productCount?: number;
}
