import type { Metadata } from "next";

import { AuthExperience } from "@/features/auth/components/auth-experience";
import { redirectAuthenticatedUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  await redirectAuthenticatedUser(params?.next ?? "/account");

  return (
    <div className="page-shell">
      <AuthExperience defaultMode="register" nextPath={params?.next ?? "/account"} />
    </div>
  );
}
