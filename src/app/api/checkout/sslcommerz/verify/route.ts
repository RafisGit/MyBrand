import { NextResponse } from "next/server";

import { verifySslCommerzPayment } from "@/lib/payments/sslcommerz";
import { markOrderPaymentStatusByReference } from "@/services/orders.service";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const status = requestUrl.searchParams.get("status");
  const validationId = requestUrl.searchParams.get("val_id");
  const paymentReference =
    requestUrl.searchParams.get("tran_id") ??
    requestUrl.searchParams.get("value_b");

  try {
    if (status === "cancelled" || status === "failed") {
      if (paymentReference) {
        await markOrderPaymentStatusByReference(paymentReference, "failed");
      }

      return NextResponse.redirect(
        new URL("/checkout?checkout=failed", request.url),
      );
    }

    if (!validationId) {
      return NextResponse.redirect(new URL("/checkout?checkout=failed", request.url));
    }

    const result = await verifySslCommerzPayment(validationId);

    if (
      result.status?.toUpperCase() === "VALID" &&
      result.tran_id
    ) {
      await markOrderPaymentStatusByReference(result.tran_id, "paid");
      return NextResponse.redirect(
        new URL("/dashboard?checkout=success", request.url),
      );
    }
  } catch {
    return NextResponse.redirect(new URL("/checkout?checkout=failed", request.url));
  }

  return NextResponse.redirect(new URL("/checkout?checkout=failed", request.url));
}

export const POST = GET;
