import { createProduct, listAdminProducts } from "@/services/admin.service";
import { productMutationSchema } from "@/lib/validations/products";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";

export async function GET(request: Request) {
  try {
    enforceRateLimit({
      key: `admin-products:get:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 60_000,
    });

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
    const result = await listAdminProducts(page, pageSize);

    return jsonSuccess(result.data, undefined, result.meta);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `admin-products:post:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    const payload = productMutationSchema.parse(await request.json());
    const product = await createProduct({
      ...payload,
      images: payload.images.map((image) => ({
        displayOrder: image.displayOrder,
        imageUrl: image.imageUrl,
      })),
      variants: payload.variants,
    });

    return jsonSuccess(product, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
