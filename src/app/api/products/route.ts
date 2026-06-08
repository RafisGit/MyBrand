import { productSearchSchema } from "@/lib/validations/products";
import { jsonError, jsonSuccess, getRequestIp } from "@/lib/utils/api";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getProducts, searchProducts } from "@/services/products.service";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createPaginationMeta } from "@/lib/utils/api";

export async function GET(request: Request) {
  try {
    enforceRateLimit({
      key: `products:${getRequestIp(request)}`,
      limit: 120,
      windowMs: 60_000,
    });

    const url = new URL(request.url);
    const params = productSearchSchema.parse({
      query: url.searchParams.get("query") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      featured: url.searchParams.get("featured") ?? undefined,
      gender: url.searchParams.get("gender") ?? undefined,
      minPrice: url.searchParams.get("minPrice") ?? undefined,
      maxPrice: url.searchParams.get("maxPrice") ?? undefined,
      sizes: url.searchParams.getAll("sizes").length
        ? url.searchParams.getAll("sizes")
        : url.searchParams.get("sizes") ?? undefined,
      colors: url.searchParams.getAll("colors").length
        ? url.searchParams.getAll("colors")
        : url.searchParams.get("colors") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });

    if (!hasSupabasePublicEnv) {
      const products = await getProducts();
      const page = params.page;
      const pageSize = params.pageSize;
      const startIndex = (page - 1) * pageSize;
      const data = products.slice(startIndex, startIndex + pageSize);

      return jsonSuccess(
        data,
        undefined,
        createPaginationMeta(page, pageSize, products.length),
      );
    }

    const result = await searchProducts(params);
    return jsonSuccess(result.data, undefined, result.meta);
  } catch (error) {
    return jsonError(error);
  }
}
