import "server-only";

import { redirect } from "next/navigation";

import {
  CUSTOMER_HOME_PATH,
  resolvePostAuthRedirectPath,
} from "@/lib/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DbUser } from "@/types/backend";
import { AppError } from "@/lib/utils/errors";

export const DEFAULT_LOGIN_REDIRECT = CUSTOMER_HOME_PATH;

export function getLoginRedirectPath(nextPath = DEFAULT_LOGIN_REDIRECT) {
  return `/auth/login?next=${encodeURIComponent(nextPath)}`;
}

export async function getCurrentAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("DEBUG: getCurrentAuthContext - authUser:", user ? { id: user.id, email: user.email } : null, "error:", error);

  if (error || !user) {
    return {
      supabase,
      authUser: null,
      profile: null,
    };
  }

  const { data: profile, error: dbError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  console.log("DEBUG: getCurrentAuthContext - profile:", profile, "dbError:", dbError);

  return {
    supabase,
    authUser: user,
    profile: (profile as DbUser | null) ?? null,
  };
}

type AuthContext = Awaited<ReturnType<typeof getCurrentAuthContext>>;

export async function requireAuthenticatedUser() {
  const context = await getCurrentAuthContext();

  if (!context.authUser || !context.profile) {
    throw new AppError("Authentication required.", 401);
  }

  return {
    supabase: context.supabase,
    authUser: context.authUser,
    profile: context.profile,
  } satisfies {
    authUser: NonNullable<AuthContext["authUser"]>;
    profile: DbUser;
    supabase: AuthContext["supabase"];
  };
}

export async function requireAdminUser() {
  const context = await requireAuthenticatedUser();

  if (context.profile.role !== "admin") {
    throw new AppError("Admin access required.", 403);
  }

  return context;
}

export async function requireAuthenticatedUserOrRedirect(nextPath = CUSTOMER_HOME_PATH) {
  const context = await getCurrentAuthContext();

  if (!context.authUser || !context.profile) {
    redirect(getLoginRedirectPath(nextPath));
  }

  const redirectPath = resolvePostAuthRedirectPath(nextPath, context.profile.role);
  if (redirectPath !== nextPath) {
    redirect(redirectPath);
  }

  return {
    supabase: context.supabase,
    authUser: context.authUser,
    profile: context.profile,
  } satisfies {
    authUser: NonNullable<AuthContext["authUser"]>;
    profile: DbUser;
    supabase: AuthContext["supabase"];
  };
}

export async function requireAdminUserOrRedirect(nextPath = "/admin") {
  const context = await requireAuthenticatedUserOrRedirect(nextPath);

  if (context.profile.role !== "admin") {
    redirect(CUSTOMER_HOME_PATH);
  }

  return context;
}

export async function redirectAuthenticatedUser(nextPath = CUSTOMER_HOME_PATH) {
  const context = await getCurrentAuthContext();

  if (!context.authUser || !context.profile) {
    return;
  }

  redirect(resolvePostAuthRedirectPath(nextPath, context.profile.role));
}
