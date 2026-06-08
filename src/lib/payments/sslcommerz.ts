import "server-only";

import { getServerEnv, publicEnv } from "@/lib/env";
import type { CheckoutPayload } from "@/types";

function getGatewayEndpoint() {
  const serverEnv = getServerEnv();

  return serverEnv.sslCommerzIsSandbox
    ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";
}

function getValidationEndpoint() {
  const serverEnv = getServerEnv();

  return serverEnv.sslCommerzIsSandbox
    ? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
    : "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";
}

export async function createSslCommerzSession(input: {
  orderId: string;
  payload: CheckoutPayload;
  paymentReference: string;
}) {
  const serverEnv = getServerEnv();

  if (!serverEnv.sslCommerzStoreId || !serverEnv.sslCommerzStorePassword) {
    return {
      url: null,
      error:
        "SSLCommerz is not configured yet. Add SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD to enable Bangladesh checkout.",
    };
  }

  const body = new URLSearchParams({
    store_id: serverEnv.sslCommerzStoreId,
    store_passwd: serverEnv.sslCommerzStorePassword,
    total_amount: input.payload.total.toFixed(2),
    currency: publicEnv.currency,
    tran_id: input.paymentReference,
    success_url: `${publicEnv.siteUrl}/api/checkout/sslcommerz/verify?status=success&order=${input.orderId}`,
    fail_url: `${publicEnv.siteUrl}/api/checkout/sslcommerz/verify?status=failed&order=${input.orderId}`,
    cancel_url: `${publicEnv.siteUrl}/api/checkout/sslcommerz/verify?status=cancelled&order=${input.orderId}`,
    ipn_url: `${publicEnv.siteUrl}/api/checkout/sslcommerz/verify`,
    shipping_method: "Courier",
    product_name: "MYBRAND Atelier Order",
    product_category: "Fashion",
    product_profile: "general",
    cus_name: input.payload.shippingAddress.fullName,
    cus_email: input.payload.shippingAddress.email,
    cus_add1: input.payload.shippingAddress.addressLine1,
    cus_add2: input.payload.shippingAddress.addressLine2 ?? "",
    cus_city: input.payload.shippingAddress.city,
    cus_state: input.payload.shippingAddress.region,
    cus_postcode: input.payload.shippingAddress.postalCode,
    cus_country: input.payload.shippingAddress.country,
    cus_phone: input.payload.shippingAddress.phone,
    ship_name: input.payload.shippingAddress.fullName,
    ship_add1: input.payload.shippingAddress.addressLine1,
    ship_add2: input.payload.shippingAddress.addressLine2 ?? "",
    ship_city: input.payload.shippingAddress.city,
    ship_state: input.payload.shippingAddress.region,
    ship_postcode: input.payload.shippingAddress.postalCode,
    ship_country: input.payload.shippingAddress.country,
    value_a: input.orderId,
    value_b: input.paymentReference,
  });

  const response = await fetch(getGatewayEndpoint(), {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      url: null,
      error: "SSLCommerz request failed. Please verify gateway credentials.",
    };
  }

  const data = (await response.json()) as { GatewayPageURL?: string };

  return {
    url: data.GatewayPageURL ?? null,
    error: data.GatewayPageURL ? null : "SSLCommerz did not return a gateway URL.",
  };
}

export async function verifySslCommerzPayment(validationId: string) {
  const serverEnv = getServerEnv();

  if (!serverEnv.sslCommerzStoreId || !serverEnv.sslCommerzStorePassword) {
    throw new Error("SSLCommerz credentials are missing.");
  }

  const url = new URL(getValidationEndpoint());
  url.searchParams.set("val_id", validationId);
  url.searchParams.set("store_id", serverEnv.sslCommerzStoreId);
  url.searchParams.set("store_passwd", serverEnv.sslCommerzStorePassword);
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("SSLCommerz validation failed.");
  }

  return (await response.json()) as {
    status?: string;
    tran_id?: string;
    val_id?: string;
  };
}
