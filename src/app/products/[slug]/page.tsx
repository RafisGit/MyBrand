import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/shared/section-heading";
import { ProductDetailView } from "@/features/products/components/product-detail-view";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getProductBySlug, getRelatedProducts } from "@/services/products.service";
import { siteConfig } from "@/lib/constants";

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

  const productUrl = `${siteConfig.url}/products/${product.slug}`;

  return {
    title: product.name,
    description: product.seoDescription,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description: product.seoDescription,
      url: productUrl,
      images: product.images.map((img) => ({
        url: img,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.seoDescription,
      images: product.images[0] ? [product.images[0]] : [],
    },
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
  const productUrl = `${siteConfig.url}/products/${product.slug}`;

  return (
    <div className="page-shell">
      <ProductJsonLd
        name={product.name}
        description={product.seoDescription}
        images={product.images}
        price={product.price}
        sku={product.slug}
        url={productUrl}
        availability={product.stock > 0 ? "InStock" : "OutOfStock"}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: siteConfig.url },
          { name: "Collection", item: `${siteConfig.url}/products` },
          { name: product.name, item: productUrl },
        ]}
      />

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
