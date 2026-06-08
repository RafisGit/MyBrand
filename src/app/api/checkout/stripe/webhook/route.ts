import { markOrderPaymentStatusByReference } from "@/services/orders.service";
import { verifyStripeWebhookSignature } from "@/lib/payments/stripe";
import { jsonError, jsonSuccess } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Stripe signature header is missing.");
    }

    const body = await request.text();
    const event = await verifyStripeWebhookSignature(body, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentReference = session.metadata?.paymentReference;

      if (paymentReference) {
        await markOrderPaymentStatusByReference(paymentReference, "paid");
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const paymentReference = session.metadata?.paymentReference;

      if (paymentReference) {
        await markOrderPaymentStatusByReference(paymentReference, "failed");
      }
    }

    return jsonSuccess({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
