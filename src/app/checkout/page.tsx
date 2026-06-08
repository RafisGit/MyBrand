import type { Metadata } from "next";

import { CheckoutExperience } from "@/features/checkout/components/checkout-experience";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Luxury checkout flow with secure payment options, shipping capture, and responsive order summary.",
};

export default function CheckoutPage() {
  return (
    <div className="page-shell">
      <CheckoutExperience />
    </div>
  );
}
