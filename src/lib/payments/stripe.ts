import "server-only";

import Stripe from "stripe";

import { getServerEnv, publicEnv } from "@/lib/env";
import type { CheckoutPayload } from "@/types";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  const serverEnv = getServerEnv();

  if (!serverEnv.stripeSecretKey) {
    return null;
  }

  stripeClient ??= new Stripe(serverEnv.stripeSecretKey);
  return stripeClient;
}

export async function createStripeCheckoutSession(input: {
  orderId: string;
  payload: CheckoutPayload;
  paymentReference: string;
}) {
  const stripe = getStripeClient();

  if (!stripe) {
    return {
      url: null,
      error:
        "Stripe is not configured yet. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable checkout.",
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${publicEnv.siteUrl}/dashboard?checkout=success&order=${input.orderId}`,
    cancel_url: `${publicEnv.siteUrl}/checkout?checkout=cancelled&order=${input.orderId}`,
    payment_method_types: ["card"],
    customer_email: input.payload.shippingAddress.email,
    line_items: input.payload.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: publicEnv.currency.toLowerCase(),
        product_data: {
          name: item.name,
          description: `${item.color} / ${item.size}`,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
    })),
    metadata: {
      orderId: input.orderId,
      paymentReference: input.paymentReference,
      paymentMethod: input.payload.paymentMethod,
    },
  });

  return {
    url: session.url,
    sessionId: session.id,
    error: null,
  };
}

export async function verifyStripeWebhookSignature(
  payload: string,
  signature: string,
) {
  const stripe = getStripeClient();
  const serverEnv = getServerEnv();

  if (!stripe || !serverEnv.stripeWebhookSecret) {
    throw new Error("Stripe webhook configuration is missing.");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    serverEnv.stripeWebhookSecret,
  );
}
