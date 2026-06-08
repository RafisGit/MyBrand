#!/usr/bin/env node
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = getArg("email") ?? process.env.ADMIN_EMAIL;
const password = getArg("password") ?? process.env.ADMIN_PASSWORD;
const fullName = getArg("name") ?? process.env.ADMIN_FULL_NAME ?? "VALTORN Admin";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!email || !password) {
  console.error("Missing admin credentials. Provide --email and --password or set ADMIN_EMAIL and ADMIN_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  try {
    const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserByEmail(email);

    let userId;

    if (fetchError && fetchError.message !== "User not found") {
      throw fetchError;
    }

    if (existingUser?.id) {
      userId = existingUser.id;
      console.log(`Found existing Supabase auth user for ${email}.`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (error) {
        throw error;
      }

      if (!data.user?.id) {
        throw new Error("Failed to create Supabase auth user.");
      }

      userId = data.user.id;
      console.log(`Created Supabase auth user for ${email}.`);
    }

    const { error: profileError } = await supabase.from("users").upsert(
      {
        id: userId,
        email,
        role: "admin",
      },
      { onConflict: "id" },
    );

    if (profileError) {
      throw profileError;
    }

    console.log(`Admin profile created/updated for ${email} with role=admin.`);
  } catch (error) {
    console.error("Admin creation failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
