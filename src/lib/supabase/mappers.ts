import { products as seedProducts } from "@/lib/data/products";
import type { DbCategory, DbProductImage, DbProductVariant, DbReview } from "@/types/backend";
import type { CatalogProduct } from "@/types/backend";
import type { Product } from "@/types";

export type ProductRecordWithRelations = {
  categories: DbCategory | null;
  created_at: string;
  description: string;
  discount_price: number | null;
  featured: boolean;
  gender: "men" | "women" | "unisex" | null;
  id: string;
  name: string;
  price: number;
  product_images: Pick<DbProductImage, "display_order" | "image_url">[] | null;
  product_variants:
    | Pick<DbProductVariant, "color" | "id" | "size" | "sku" | "stock">[]
    | null;
  reviews: Pick<DbReview, "rating">[] | null;
  slug: string;
  status: "draft" | "active" | "archived";
  stock: number;
  updated_at: string;
};

export function mapProductRecord(record: ProductRecordWithRelations): CatalogProduct {
  const sortedImages = [...(record.product_images ?? [])].sort(
    (left, right) => left.display_order - right.display_order,
  );
  const seedMatch = seedProducts.find((seedProduct) => seedProduct.slug === record.slug);
  const imageUrls = sortedImages.map((image) => image.image_url);

  if (imageUrls.length < 3 && seedMatch) {
    for (let index = imageUrls.length; index < 3; index += 1) {
      imageUrls.push(seedMatch.images[index] ?? seedMatch.images[0]);
    }
  }

  const variants = record.product_variants ?? [];
  const reviews = record.reviews ?? [];
  const averageRating = reviews.length
    ? Number(
        (
          reviews.reduce((runningTotal, review) => runningTotal + review.rating, 0) /
          reviews.length
        ).toFixed(1),
      )
    : null;

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    price: Number(record.price),
    discountPrice: record.discount_price === null ? null : Number(record.discount_price),
    stock: record.stock,
    gender: record.gender,
    featured: record.featured,
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    category: {
      id: record.categories?.id ?? null,
      name: record.categories?.name ?? null,
      slug: record.categories?.slug ?? null,
    },
    images: imageUrls,
    primaryImage: imageUrls[0] ?? null,
    availableSizes: Array.from(new Set(variants.map((variant) => variant.size))),
    availableColors: Array.from(new Set(variants.map((variant) => variant.color))),
    variants: variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sku: variant.sku,
    })),
    averageRating,
    reviewCount: reviews.length,
  };
}

export function mapCatalogProductToStorefront(product: CatalogProduct): Product {
  const seedMatch = seedProducts.find((seedProduct) => seedProduct.slug === product.slug);
  const activePrice = product.discountPrice ?? product.price;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription:
      seedMatch?.shortDescription ??
      `${product.description.slice(0, 110).trim()}${product.description.length > 110 ? "..." : ""}`,
    story:
      seedMatch?.story ??
      "Built for a premium fashion storefront with editorial presence, scalable inventory, and modern commerce operations.",
    price: activePrice,
    compareAtPrice: product.discountPrice ? product.price : seedMatch?.compareAtPrice,
    category: (product.category.name ?? "Streetwear") as Product["category"],
    collection:
      seedMatch?.collection ??
      `${product.category.name ?? "Connected"} Collection`,
    images: product.images.length ? product.images : seedMatch?.images ?? [],
    sizes: product.availableSizes,
    colors: product.availableColors,
    stock: product.stock,
    featured: product.featured,
    bestSeller:
      seedMatch?.bestSeller ??
      Boolean(product.featured && (product.averageRating ?? 0) >= 4.5),
    rating: product.averageRating ?? seedMatch?.rating ?? 4.8,
    materials: seedMatch?.materials ?? ["Premium fabrication"],
    seoDescription: seedMatch?.seoDescription ?? product.description,
    createdAt: product.createdAt,
  };
}
