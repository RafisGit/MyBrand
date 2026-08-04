import { createOrderFromCheckoutPayload } from "@/services/orders.service";
import { createSslCommerzSession } from "@/lib/payments/sslcommerz";
import { checkoutPayloadSchema } from "@/lib/validations/orders";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `checkout:nagad:${getRequestIp(request)}`,
      limit: 10,
      windowMs: 60_000,
    });

    const payload = checkoutPayloadSchema.parse(await request.json());
    const paymentReference = `NAGAD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    
    const order = await createOrderFromCheckoutPayload({
      items: payload.items,
      paymentMethod: "nagad",
      paymentReference,
      paymentStatus: "unpaid",
      shippingAddress: payload.shippingAddress,
    });

    const env = getServerEnv();
    if (env.sslCommerzStoreId && env.sslCommerzStorePassword) {
      const result = await createSslCommerzSession({
        orderId: order.id,
        payload,
        paymentReference,
      });

      if (result.url) {
        return jsonSuccess({
          orderId: order.id,
          paymentReference,
          url: result.url,
        });
      }
    }

    return jsonSuccess({
      orderId: order.id,
      paymentReference,
      url: `/account?orderCreated=true&orderId=${order.id}&paymentMethod=nagad`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
