import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/shared/section-heading";
import { ProductDetailView } from "@/features/products/components/product-detail-view";
import { ProductCard } from "@/features/products/components/product-card";
import { getProductBySlug, getRelatedProducts } from "@/services/products.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.seoDescription,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.slug, product.category);

  return (
    <div className="page-shell">
      <ProductDetailView product={product} />

      <section className="space-y-10">
        <SectionHeading
          eyebrow="Related Pieces"
          title="Keep the palette tight and the silhouette intentional."
          description="Related products are scoped by category and ready to be driven from Supabase in production."
        />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
