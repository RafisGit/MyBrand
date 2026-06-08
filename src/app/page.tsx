import { ValtornHome } from "@/features/home/components/valtorn-home";
import { getProducts } from "@/services/products.service";
import type { Product } from "@/types";

function selectHomepageProducts(products: Product[]) {
  const groups = [
    ["tee", "t-shirt", "oversized"],
    ["pant", "trouser", "cargo"],
    ["shirt", "hoodie"],
    ["bomber", "jacket", "streetwear", "polo"],
  ];

  const selected: Product[] = [];

  for (const keywords of groups) {
    const match = products.find((product) => {
      if (selected.some((item) => item.id === product.id)) {
        return false;
      }

      const haystack = `${product.name} ${product.category} ${product.collection}`.toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    });

    if (match) {
      selected.push(match);
    }
  }

  const rankedFallback = [...products].sort((left, right) => {
    const rightScore = Number(right.bestSeller) + Number(right.featured);
    const leftScore = Number(left.bestSeller) + Number(left.featured);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  for (const product of rankedFallback) {
    if (selected.length >= 4) {
      break;
    }

    if (!selected.some((item) => item.id === product.id)) {
      selected.push(product);
    }
  }

  return selected.slice(0, 4);
}

export default async function Home() {
  const products = await getProducts();
  const homepageProducts = selectHomepageProducts(products);

  return <ValtornHome products={homepageProducts} />;
}
