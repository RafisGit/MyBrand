"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary";
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true);

        try {
          if (hasSupabasePublicEnv) {
            const supabase = createClient();
            const { error } = await supabase.auth.signOut();

            if (error) {
              throw error;
            }
          }

          window.location.assign("/auth/login");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Unable to sign out.",
          );
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Sign Out
    </Button>
  );
}
