import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { getServerEnv, publicEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

function assertSupabaseEnv() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    throw new Error(
      "Supabase public environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

type CreateSupabaseServerClientOptions = {
  requestCookies?: ReturnType<typeof cookies> | Promise<ReturnType<typeof cookies>>;
  response?: NextResponse;
};

export async function createSupabaseServerClient(
  options: CreateSupabaseServerClientOptions = {},
) {
  assertSupabaseEnv();

  const cookieStore = options.requestCookies
    ? await options.requestCookies
    : await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              cookieStore.set(name, value, cookieOptions);
            });
          } catch {
            // Safe to ignore in Server Components where cookies are read-only
          }

          if (options.response) {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              options.response!.cookies.set(name, value, cookieOptions);
            });
          }
        },
      },
    },
  );
}

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createSupabaseAdminClient() {
  assertSupabaseEnv();

  if (adminClient) {
    return adminClient;
  }

  const serverEnv = getServerEnv();

  if (!serverEnv.supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to create a Supabase admin client.",
    );
  }

  adminClient = createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return adminClient;
}

export function createSupabasePublicClient() {
  assertSupabaseEnv();
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export const createClient = createSupabaseServerClient;
