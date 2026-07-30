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

export function ProductJsonLd({
  name,
  description,
  images,
  price,
  currency = "USD",
  sku,
  availability = "InStock",
}: {
  name: string;
  description: string;
  images: string[];
  price: number;
  currency?: string;
  sku?: string;
  availability?: string;
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
      url: "https://valtorn.com/products",
      priceCurrency: currency,
      price: price.toFixed(2),
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
