import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getProductBySlug, getRelatedProducts } from "@/services/products.service";
import { AppError } from "@/lib/utils/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    enforceRateLimit({
      key: `product:${getRequestIp(request)}`,
      limit: 180,
      windowMs: 60_000,
    });

    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      throw new AppError("Product not found.", 404);
    }

    const related = await getRelatedProducts(product.slug, product.category);

    return jsonSuccess({
      product,
      related,
    });
  } catch (error) {
    return jsonError(error);
  }
}
