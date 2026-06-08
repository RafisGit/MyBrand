import { createCategory } from "@/services/admin.service";
import { getCategories } from "@/services/products.service";
import { categorySchema } from "@/lib/validations/products";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";

export async function GET(request: Request) {
  try {
    enforceRateLimit({
      key: `admin-categories:get:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 60_000,
    });

    const categories = await getCategories();
    return jsonSuccess(categories);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `admin-categories:post:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    const payload = categorySchema.parse(await request.json());
    const category = await createCategory(payload);

    return jsonSuccess(category, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
