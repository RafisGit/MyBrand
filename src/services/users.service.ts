import "server-only";

import { requireAdminUser, requireAuthenticatedUser } from "@/lib/auth";
import type { Address, UserProfile } from "@/types";

function dedupeAddresses(addresses: Address[]) {
  const seen = new Set<string>();

  return addresses.filter((address) => {
    const key = `${address.addressLine1}:${address.postalCode}:${address.country}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function getProfile(): Promise<UserProfile> {
  const { profile } = await requireAuthenticatedUser();

  return {
    id: profile.id,
    name: profile.full_name ?? "Customer",
    email: profile.email,
    role: profile.role,
    createdAt: profile.created_at,
  };
}

export async function getSavedAddresses() {
  const { profile, supabase } = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from("orders")
    .select("shipping_address")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  const addresses = (data ?? [])
    .map((record) => record.shipping_address as unknown as Address)
    .filter(Boolean);

  return dedupeAddresses(addresses);
}

export async function getCustomerCount() {
  const { supabase } = await requireAdminUser();
  const { count, error } = await supabase
    .from("users")
    .select("id", { head: true, count: "exact" })
    .eq("role", "customer");

  if (error) {
    throw error;
  }

  return count ?? 0;
}
