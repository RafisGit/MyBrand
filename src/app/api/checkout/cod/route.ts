import { createOrderFromCheckoutPayload } from "@/services/orders.service";
import { checkoutPayloadSchema } from "@/lib/validations/orders";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `checkout:cod:${getRequestIp(request)}`,
      limit: 10,
      windowMs: 60_000,
    });

    const payload = checkoutPayloadSchema.parse(await request.json());
    const paymentReference = `COD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    
    const order = await createOrderFromCheckoutPayload({
      items: payload.items,
      paymentMethod: payload.paymentMethod,
      paymentReference,
      paymentStatus: "unpaid",
      shippingAddress: payload.shippingAddress,
    });

    return jsonSuccess({
      orderId: order.id,
      paymentReference,
      url: `/account?orderCreated=true&orderId=${order.id}`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
