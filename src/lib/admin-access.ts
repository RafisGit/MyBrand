import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { UserRole } from "@/types/backend";
import { hasSupabaseServiceRoleKey } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const CUSTOMER_HOME_PATH = "/account";
export const ADMIN_HOME_PATH = "/admin";

export async function synchronizeUserRole(
  user: Pick<User, "email" | "id">,
  supabaseClient?: SupabaseClient<Database>,
) {
  const email = user.email?.trim().toLowerCase() ?? "";

  let result;
  if (hasSupabaseServiceRoleKey) {
    const adminClient = createSupabaseAdminClient();
    result = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
  } else if (supabaseClient) {
    result = await supabaseClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
  } else {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to resolve user roles when no authenticated Supabase client is available. Add it to your server environment or pass a Supabase client.",
    );
  }

  const { data: profile, error } = result;

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    if (hasSupabaseServiceRoleKey) {
      const adminClient = createSupabaseAdminClient();
      await adminClient.from("users").insert({
        id: user.id,
        email,
        role: "customer",
      });

      return "customer" as UserRole;
    }

    return "customer" as UserRole;
  }

  return profile.role;
}

export function resolvePostAuthRedirectPath(
  nextPath: string,
  role: UserRole,
) {
  const normalizedNextPath = normalizePostAuthPath(nextPath);

  if (role === "admin") {
    return normalizedNextPath.startsWith("/admin")
      ? normalizedNextPath
      : ADMIN_HOME_PATH;
  }

  if (normalizedNextPath.startsWith("/admin")) {
    return CUSTOMER_HOME_PATH;
  }

  return normalizedNextPath;
}

export function normalizePostAuthPath(nextPath: string | null | undefined) {
  const fallback = CUSTOMER_HOME_PATH;

  if (!nextPath) {
    return fallback;
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  if (
    nextPath.startsWith("/auth/login") ||
    nextPath.startsWith("/auth/register") ||
    nextPath.startsWith("/auth/reset-password") ||
    nextPath.startsWith("/auth/callback") ||
    nextPath.startsWith("/auth/confirm")
  ) {
    return fallback;
  }

  if (nextPath === "/dashboard" || nextPath.startsWith("/dashboard?")) {
    return nextPath.replace("/dashboard", CUSTOMER_HOME_PATH);
  }

  if (nextPath === "/") {
    return fallback;
  }

  return nextPath;
}

export function getRoleHomePath(role: UserRole) {
  return role === "admin" ? ADMIN_HOME_PATH : CUSTOMER_HOME_PATH;
}




