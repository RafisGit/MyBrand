import type { Metadata } from "next";

import { CollectionPage } from "@/features/products/components/collection-page";
import { getProducts } from "@/services/products.service";

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
  const products = await getProducts();
  const params = searchParams ? await searchParams : undefined;
  const defaultCategory = params?.category;
  const defaultSortParam = params?.sort;

  return (
    <CollectionPage
      products={products}
      defaultCategory={defaultCategory}
      defaultSortParam={defaultSortParam}
    />
  );
}
