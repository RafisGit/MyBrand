import type { Metadata } from "next";

import { AuthExperience } from "@/features/auth/components/auth-experience";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;

  return (
    <div className="page-shell">
      <AuthExperience defaultMode="reset" nextPath={params?.next ?? "/account"} />
    </div>
  );
}
