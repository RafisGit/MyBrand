import React from "react";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VALTORN",
    url: "https://valtorn.com",
    logo: "https://valtorn.com/favicon.ico",
    description: "Premium architectural streetwear brand engineered with heavyweight cotton and minimal silhouettes.",
    sameAs: [
      "https://instagram.com/valtorn",
      "https://twitter.com/valtorn",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; item: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  images,
  price,
  currency = "USD",
  sku,
  availability = "InStock",
  url,
}: {
  name: string;
  description: string;
  images: string[];
  price: number;
  currency?: string;
  sku?: string;
  availability?: string;
  url?: string;
}) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    image: images,
    description,
    sku: sku || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    brand: {
      "@type": "Brand",
      name: "VALTORN",
    },
    offers: {
      "@type": "Offer",
      url: url || "https://valtorn.com/products",
      priceCurrency: currency,
      price: price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: `https://schema.org/${availability}`,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
