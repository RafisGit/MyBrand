import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils/slug";
import { AppError } from "@/lib/utils/errors";
import type { DbCategory, PaginatedResult } from "@/types/backend";
import type { CatalogProduct } from "@/types/backend";
import { createPaginationMeta } from "@/lib/utils/api";
import { mapProductRecord } from "@/lib/supabase/mappers";

function validateThreeImages(images: { displayOrder: number; imageUrl: string }[]) {
  if (images.length !== 3) {
    throw new AppError("Product must include exactly 3 images.", 400);
  }

  const uniqueOrders = new Set(images.map((image) => image.displayOrder));
  if (uniqueOrders.size !== 3 || ![0, 1, 2].every((value) => uniqueOrders.has(value))) {
    throw new AppError(
      "Product images must include hero, flat lay, and macro variations with display_order 0, 1, and 2.",
      400,
    );
  }
}

const ADMIN_PRODUCT_SELECT = `
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

type AdminProductRecord = {
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

function revalidateCommercePaths() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidateTag("categories");
}

async function createAuthorizedAdminClient() {
  await requireAdminUser();
  return createSupabaseAdminClient();
}

export async function listAdminProducts(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<CatalogProduct>> {
  const { supabase } = await requireAdminUser();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []).map((record) => mapProductRecord(record as AdminProductRecord)),
    meta: createPaginationMeta(page, pageSize, count ?? 0),
  };
}

export async function createCategory(input: { name: string; slug?: string }) {
  const adminClient = await createAuthorizedAdminClient();

  const { data, error } = await adminClient
    .from("categories")
    .insert({
      name: input.name,
      slug: input.slug ?? toSlug(input.name),
    })
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  revalidateCommercePaths();
  return data;
}

export async function updateCategory(
  categoryId: string,
  input: { name: string; slug?: string },
) {
  const adminClient = await createAuthorizedAdminClient();

  const { data, error } = await adminClient
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug ?? toSlug(input.name),
    })
    .eq("id", categoryId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new AppError("Category not found.", 404);
  }

  revalidateCommercePaths();
  return data;
}

export async function deleteCategory(categoryId: string) {
  const adminClient = await createAuthorizedAdminClient();

  const { error } = await adminClient.from("categories").delete().eq("id", categoryId);

  if (error) {
    throw error;
  }

  revalidateCommercePaths();
}

export async function createProduct(input: {
  categoryId?: string | null;
  description: string;
  discountPrice?: number | null;
  featured: boolean;
  gender: "men" | "women" | "unisex";
  images: { displayOrder: number; imageUrl: string }[];
  name: string;
  price: number;
  slug?: string;
  status: "draft" | "active" | "archived";
  variants: { color: string; size: string; sku: string; stock: number }[];
}) {
  const adminClient = await createAuthorizedAdminClient();

  const { data: product, error: productError } = await adminClient
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug ?? toSlug(input.name),
      description: input.description,
      price: input.price,
      discount_price: input.discountPrice ?? null,
      category_id: input.categoryId ?? null,
      gender: input.gender,
      featured: input.featured,
      status: input.status,
    })
    .select("id")
    .maybeSingle();

  if (productError) {
    throw productError;
  }

  if (!product) {
    throw new AppError("Product could not be created.", 500);
  }

  validateThreeImages(input.images);

  const { error: imagesError } = await adminClient.from("product_images").insert(
    input.images.map((image) => ({
      product_id: product.id,
      image_url: image.imageUrl,
      display_order: image.displayOrder,
    })),
  );

  if (imagesError) {
    throw imagesError;
  }

  const { error: variantsError } = await adminClient.from("product_variants").insert(
    input.variants.map((variant) => ({
      product_id: product.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sku: variant.sku,
    })),
  );

  if (variantsError) {
    throw variantsError;
  }

  revalidateCommercePaths();
  return product;
}

export async function updateProduct(
  productId: string,
  input: {
    categoryId?: string | null;
    description: string;
    discountPrice?: number | null;
    featured: boolean;
    gender: "men" | "women" | "unisex";
    images: { displayOrder: number; imageUrl: string }[];
    name: string;
    price: number;
    slug?: string;
    status: "draft" | "active" | "archived";
    variants: { color: string; size: string; sku: string; stock: number }[];
  },
) {
  const adminClient = await createAuthorizedAdminClient();

  const { error: productError } = await adminClient
    .from("products")
    .update({
      name: input.name,
      slug: input.slug ?? toSlug(input.name),
      description: input.description,
      price: input.price,
      discount_price: input.discountPrice ?? null,
      category_id: input.categoryId ?? null,
      gender: input.gender,
      featured: input.featured,
      status: input.status,
    })
    .eq("id", productId);

  if (productError) {
    throw productError;
  }

  const { error: deleteImagesError } = await adminClient
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteImagesError) {
    throw deleteImagesError;
  }

  const { error: deleteVariantsError } = await adminClient
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (deleteVariantsError) {
    throw deleteVariantsError;
  }

  validateThreeImages(input.images);

  const { error: imagesError } = await adminClient.from("product_images").insert(
    input.images.map((image) => ({
      product_id: productId,
      image_url: image.imageUrl,
      display_order: image.displayOrder,
    })),
  );

  if (imagesError) {
    throw imagesError;
  }

  const { error: variantsError } = await adminClient.from("product_variants").insert(
    input.variants.map((variant) => ({
      product_id: productId,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      sku: variant.sku,
    })),
  );

  if (variantsError) {
    throw variantsError;
  }

  revalidateCommercePaths();
}

export async function deleteProduct(productId: string) {
  const adminClient = await createAuthorizedAdminClient();

  const { error } = await adminClient.from("products").delete().eq("id", productId);

  if (error) {
    throw error;
  }

  revalidateCommercePaths();
}

export async function duplicateProduct(productId: string) {
  const adminClient = await createAuthorizedAdminClient();

  const { data, error } = await adminClient
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new AppError("Product not found.", 404);
  }

  const record = data as AdminProductRecord;
  const baseSlug = `${record.slug}-copy`;
  const nextName = `${record.name} Copy`;

  const duplicate = await createProduct({
    categoryId: record.categories?.id ?? null,
    description: record.description,
    discountPrice: record.discount_price,
    featured: false,
    gender: record.gender ?? "unisex",
    images: (record.product_images ?? []).map((image) => ({
      displayOrder: image.display_order,
      imageUrl: image.image_url,
    })),
    name: nextName,
    price: Number(record.price),
    slug: `${baseSlug}-${Date.now().toString().slice(-5)}`,
    status: "draft",
    variants: (record.product_variants ?? []).map((variant, index) => ({
      color: variant.color,
      size: variant.size,
      sku: `${variant.sku}-COPY-${index + 1}`,
      stock: variant.stock,
    })),
  });

  revalidateCommercePaths();
  return duplicate;
}

export async function archiveProduct(productId: string) {
  const adminClient = await createAuthorizedAdminClient();

  const { data, error } = await adminClient
    .from("products")
    .update({ status: "archived" })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new AppError("Product not found.", 404);
  }

  revalidateCommercePaths();
  return data;
}

export async function listAdminCollections() {
  const adminClient = await createAuthorizedAdminClient();

  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      adminClient.from("categories").select("id, name, slug, created_at").order("name"),
      adminClient.from("products").select("id, category_id"),
    ]);

  if (categoriesError) {
    throw categoriesError;
  }

  if (productsError) {
    throw productsError;
  }

  const productCounts = new Map<string, number>();

  for (const product of products ?? []) {
    if (!product.category_id) {
      continue;
    }

    productCounts.set(
      product.category_id,
      (productCounts.get(product.category_id) ?? 0) + 1,
    );
  }

  return (categories ?? []).map((category) => ({
    createdAt: category.created_at,
    id: category.id,
    name: category.name,
    productCount: productCounts.get(category.id) ?? 0,
    slug: category.slug,
  }));
}
