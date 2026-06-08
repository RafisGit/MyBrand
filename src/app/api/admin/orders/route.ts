import { getRecentOrders } from "@/services/orders.service";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { enforceRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: Request) {
  try {
    enforceRateLimit({
      key: `admin-orders:get:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 60_000,
    });

    const orders = await getRecentOrders();
    return jsonSuccess(orders);
  } catch (error) {
    return jsonError(error);
  }
}
