import { createStripeCheckoutSession } from "@/lib/payments/stripe";
import { checkoutPayloadSchema } from "@/lib/validations/orders";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { createOrderFromCheckoutPayload, markOrderPaymentStatusByReference } from "@/services/orders.service";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `checkout:stripe:${getRequestIp(request)}`,
      limit: 10,
      windowMs: 60_000,
    });

    const payload = checkoutPayloadSchema.parse(await request.json());
    const paymentReference = crypto.randomUUID();
    const order = await createOrderFromCheckoutPayload({
      items: payload.items,
      paymentMethod: "stripe",
      paymentReference,
      paymentStatus: "unpaid",
      shippingAddress: payload.shippingAddress,
    });

    const result = await createStripeCheckoutSession({
      orderId: order.id,
      payload,
      paymentReference,
    });

    if (!result.url) {
      await markOrderPaymentStatusByReference(paymentReference, "failed");
      throw new Error(result.error ?? "Stripe checkout failed.");
    }

    return jsonSuccess({
      orderId: order.id,
      paymentReference,
      url: result.url,
    });
  } catch (error) {
    return jsonError(error);
  }
}
