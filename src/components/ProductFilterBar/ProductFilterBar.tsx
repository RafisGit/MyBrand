"use client";

import { ProductFilter, type ProductFilterProps } from "../ProductFilter";

export type { ProductFilterProps as ProductFilterBarProps };

export function ProductFilterBar(props: ProductFilterProps) {
  return <ProductFilter {...props} />;
}
