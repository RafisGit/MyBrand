import { updateOrderStatus } from "@/services/orders.service";
import { orderStatusSchema } from "@/lib/validations/orders";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `admin-orders:patch:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    const payload = orderStatusSchema.parse(await request.json());
    const { id } = await params;
    const order = await updateOrderStatus(id, payload);

    return jsonSuccess(order);
  } catch (error) {
    return jsonError(error);
  }
}
