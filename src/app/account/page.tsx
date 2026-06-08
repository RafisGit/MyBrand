import type { Metadata } from "next";

import { requireAuthenticatedUserOrRedirect } from "@/lib/auth";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getOrders } from "@/services/orders.service";
import { getProducts } from "@/services/products.service";
import { getProfile, getSavedAddresses } from "@/services/users.service";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Customer account dashboard for order history, addresses, and saved pieces.",
};

export default async function AccountPage() {
  await requireAuthenticatedUserOrRedirect("/account");

  const [profile, addresses, orders, products] = await Promise.all([
    getProfile(),
    getSavedAddresses(),
    getOrders(),
    getProducts(),
  ]);

  return (
    <div className="page-shell">
      <DashboardOverview
        profile={profile}
        addresses={addresses}
        orders={orders}
        products={products}
      />
    </div>
  );
}
