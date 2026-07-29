import type { Metadata } from "next";

import { CollectionPage } from "@/features/products/components/collection-page";
import { getCategories, getProducts } from "@/services/products.service";

export const metadata: Metadata = {
  title: "Collection",
  description:
    "Browse premium VALTORN essentials with a dark editorial grid, sticky luxury filters, and a cleaner menswear shopping flow.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; sort?: string }>;
}) {
  const [products, dbCategories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const params = searchParams ? await searchParams : undefined;
  const defaultCategory = params?.category;
  const defaultSortParam = params?.sort;

  return (
    <CollectionPage
      products={products}
      categories={dbCategories}
      defaultCategory={defaultCategory}
      defaultSortParam={defaultSortParam}
    />
  );
}
