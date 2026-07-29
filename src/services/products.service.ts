import "server-only";

import { unstable_cache } from "next/cache";

import { catalogCategories } from "@/lib/constants";
import { hasSupabasePublicEnv, hasSupabaseServiceRoleKey } from "@/lib/env";
import { mapCatalogProductToStorefront, mapProductRecord } from "@/lib/supabase/mappers";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogProduct, DbCategory, PaginatedResult, ProductSearchParams } from "@/types/backend";
import type { Product } from "@/types";
import { createPaginationMeta } from "@/lib/utils/api";

const PRODUCT_SELECT = `
  id,
  name,
  slug,
  description,
  price,
  discount_price,
  stock,
  gender,
  featured,
  status,
  created_at,
  updated_at,
  categories ( id, name, slug ),
  product_images ( image_url, display_order ),
  product_variants ( id, size, color, stock, sku ),
  reviews ( rating )
`;

type ProductQueryRecord = {
  categories: DbCategory | null;
  created_at: string;
  description: string;
  discount_price: number | null;
  featured: boolean;
  gender: "men" | "women" | "unisex" | null;
  id: string;
  name: string;
  price: number;
  product_images: { display_order: number; image_url: string }[] | null;
  product_variants: {
    color: string;
    id: string;
    size: string;
    sku: string;
    stock: number;
  }[] | null;
  reviews: { rating: number }[] | null;
  slug: string;
  status: "draft" | "active" | "archived";
  stock: number;
  updated_at: string;
};

function sortProductsByLatest(items: Product[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

async function createStorefrontReadClient() {
  if (hasSupabaseServiceRoleKey) {
    return createSupabaseAdminClient();
  }

  return createSupabaseServerClient();
}

async function fetchProductRecords() {
  const supabase = await createStorefrontReadClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductQueryRecord[];
}

export const getCategories = unstable_cache(
  async () => {
    if (!hasSupabasePublicEnv) {
      return catalogCategories.map((name) => ({
        id: name.toLowerCase(),
        name,
        slug: name.toLowerCase(),
      }));
    }

    try {
      const supabase = await createStorefrontReadClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    } catch {
      return catalogCategories.map((name) => ({
        id: name.toLowerCase(),
        name,
        slug: name.toLowerCase(),
      }));
    }
  },
  ["categories"],
  { revalidate: 300, tags: ["categories"] },
);

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  if (!hasSupabasePublicEnv) {
    return [];
  }

  const records = await fetchProductRecords();
  return records.map((record) => mapProductRecord(record));
}

export async function getProducts() {
  if (!hasSupabasePublicEnv) {
    const { products } = await import("@/lib/data/products");
    return sortProductsByLatest(products);
  }

  try {
    const products = await getCatalogProducts();
    return products.map((product) => mapCatalogProductToStorefront(product));
  } catch {
    const { products } = await import("@/lib/data/products");
    return sortProductsByLatest(products);
  }
}

export async function searchProducts(
  params: ProductSearchParams = {},
): Promise<PaginatedResult<CatalogProduct>> {
  const supabase = await createStorefrontReadClient();

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;

  const { data, error } = await supabase.rpc("search_products", {
    p_query: params.query ?? null,
    p_category_slug: params.category ?? null,
    p_min_price: params.minPrice ?? null,
    p_max_price: params.maxPrice ?? null,
    p_sizes: params.sizes?.length ? params.sizes : null,
    p_colors: params.colors?.length ? params.colors : null,
    p_featured_only: params.featured ?? false,
    p_gender: params.gender ?? null,
    p_sort: params.sort ?? "latest",
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const total = rows[0]?.total_count ?? 0;

  return {
    data: rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: Number(row.price),
      discountPrice: row.discount_price === null ? null : Number(row.discount_price),
      stock: Number(row.total_stock),
      gender: row.gender,
      featured: row.featured,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      },
      images: row.image_urls ?? [],
      primaryImage: row.primary_image,
      availableSizes: row.available_sizes ?? [],
      availableColors: row.available_colors ?? [],
      variants: [],
      averageRating: null,
      reviewCount: 0,
    })),
    meta: createPaginationMeta(page, pageSize, total),
  };
}

export async function getFeaturedProducts() {
  const allProducts = await getProducts();
  return allProducts.filter((product) => product.featured).slice(0, 4);
}

export async function getBestSellerProducts() {
  const allProducts = await getProducts();
  return allProducts.filter((product) => product.bestSeller).slice(0, 4);
}

export async function getProductBySlug(slug: string) {
  if (!hasSupabasePublicEnv) {
    const { products } = await import("@/lib/data/products");
    return products.find((product) => product.slug === slug) ?? null;
  }

  try {
    const supabase = await createStorefrontReadClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapCatalogProductToStorefront(mapProductRecord(data as ProductQueryRecord));
  } catch {
    const { products } = await import("@/lib/data/products");
    return products.find((product) => product.slug === slug) ?? null;
  }
}

export async function getProductCatalogBySlug(slug: string) {
  const supabase = await createStorefrontReadClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProductRecord(data as ProductQueryRecord);
}

export async function getRelatedProducts(slug: string, category: string) {
  const allProducts = await getProducts();
  return allProducts
    .filter((product) => product.slug !== slug && product.category === category)
    .slice(0, 4);
}

export async function getProductsByIds(ids: string[]) {
  const allProducts = await getProducts();
  return allProducts.filter((product) => ids.includes(product.id));
}
