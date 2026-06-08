import type { Metadata } from "next";

import { AuthExperience } from "@/features/auth/components/auth-experience";
import { redirectAuthenticatedUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  await redirectAuthenticatedUser(params?.next ?? "/account");

  return (
    <div className="page-shell">
      <AuthExperience defaultMode="login" nextPath={params?.next ?? "/account"} />
    </div>
  );
}
