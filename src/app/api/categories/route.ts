import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getCategories } from "@/services/products.service";

export async function GET(request: Request) {
  try {
    enforceRateLimit({
      key: `categories:${getRequestIp(request)}`,
      limit: 180,
      windowMs: 60_000,
    });

    const categories = await getCategories();
    return jsonSuccess(categories);
  } catch (error) {
    return jsonError(error);
  }
}
