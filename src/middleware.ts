import { NextResponse, type NextRequest } from "next/server";

import {
  CUSTOMER_HOME_PATH,
  resolvePostAuthRedirectPath,
  synchronizeUserRole,
} from "@/lib/admin-access";
import { hasSupabasePublicEnv } from "@/lib/env";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

import { getLoginRedirectPath } from "@/lib/auth";

function createLoginRedirect(request: NextRequest) {
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL(getLoginRedirectPath(nextPath), request.url);
  return NextResponse.redirect(loginUrl);
}

function createApiErrorResponse(status: 401 | 403, message: string) {
  return NextResponse.json(
    { error: message },
    { status },
  );
}

export async function middleware(request: NextRequest) {
  if (!hasSupabasePublicEnv) {
    return NextResponse.next();
  }

  const { supabase, user, response } = await updateSupabaseSession(request);
  const pathname = request.nextUrl.pathname;
  console.log("MIDDLEWARE:", {
    pathname,
    cookies: request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 15)}...`),
    hasUser: !!user,
    userId: user?.id,
  });
  const isApiRequest = pathname.startsWith("/api/");
  const requiresAuth =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/cart") ||
    pathname.startsWith("/api/orders") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/checkout");

  if (!requiresAuth) {
    return response;
  }

  if (!user) {
    return isApiRequest
      ? createApiErrorResponse(401, "Authentication required.")
      : createLoginRedirect(request);
  }

  const role = await synchronizeUserRole(user, supabase);
  const adminRedirectPath = resolvePostAuthRedirectPath(CUSTOMER_HOME_PATH, role);

  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/account")) &&
    adminRedirectPath === "/admin"
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (role !== "admin") {
      return isApiRequest
        ? createApiErrorResponse(403, "Admin access required.")
        : NextResponse.redirect(new URL(CUSTOMER_HOME_PATH, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/admin/:path*",
    "/api/checkout/:path*",
  ],
};

