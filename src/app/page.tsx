import { ValtornHome } from "@/features/home/components/valtorn-home";
import { getProducts } from "@/services/products.service";
import { getHomepageSections } from "@/services/cms.service";
import type { Product } from "@/types";

function selectHomepageProducts(products: Product[]) {
  const featuredProducts = [...products]
    .filter((product) => product.featured)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  const latestProducts = [...products].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const selected: Product[] = [];

  for (const product of [...featuredProducts, ...latestProducts]) {
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
  const [products, sections] = await Promise.all([
    getProducts(),
    getHomepageSections(),
  ]);
  const homepageProducts = selectHomepageProducts(products);

  return <ValtornHome products={homepageProducts} sections={sections} />;
}
