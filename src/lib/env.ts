import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_CURRENCY: z.string().min(3).default("BDT"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  SSLCOMMERZ_STORE_ID: optionalString,
  SSLCOMMERZ_STORE_PASSWORD: optionalString,
  SSLCOMMERZ_IS_SANDBOX: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value !== "false"),
});

const parsedPublicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

export const publicEnv = {
  siteUrl: parsedPublicEnv.NEXT_PUBLIC_SITE_URL,
  currency: parsedPublicEnv.NEXT_PUBLIC_CURRENCY,
  supabaseUrl: parsedPublicEnv.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: parsedPublicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  stripePublishableKey:
    parsedPublicEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
};

export const hasSupabasePublicEnv = Boolean(
  publicEnv.supabaseUrl && publicEnv.supabaseAnonKey,
);

export const hasStripeClientEnv = Boolean(publicEnv.stripePublishableKey);
export const hasSupabaseServiceRoleKey = Boolean(
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

let cachedServerEnv: null | {
  supabaseServiceRoleKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  sslCommerzStoreId?: string;
  sslCommerzStorePassword?: string;
  sslCommerzIsSandbox: boolean;
} = null;

export function getServerEnv() {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const result = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
    SSLCOMMERZ_STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD,
    SSLCOMMERZ_IS_SANDBOX: process.env.SSLCOMMERZ_IS_SANDBOX,
  });

  if (!result.success) {
    throw new Error(
      `Server environment validation failed: ${result.error.issues
        .map((issue) => issue.path.join("."))
        .join(", ")}`,
    );
  }

  cachedServerEnv = {
    supabaseServiceRoleKey: result.data.SUPABASE_SERVICE_ROLE_KEY,
    stripeSecretKey: result.data.STRIPE_SECRET_KEY,
    stripeWebhookSecret: result.data.STRIPE_WEBHOOK_SECRET,
    sslCommerzStoreId: result.data.SSLCOMMERZ_STORE_ID,
    sslCommerzStorePassword: result.data.SSLCOMMERZ_STORE_PASSWORD,
    sslCommerzIsSandbox: result.data.SSLCOMMERZ_IS_SANDBOX,
  };

  return cachedServerEnv;
}
