"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthExperience } from "@/features/auth/components/auth-experience";

export function UserAuthButton() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!hasSupabasePublicEnv) {
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session?.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated) {
    return (
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-full bg-white/90 ring-1 ring-black/10"
      >
        <Link href="/account" aria-label="Account">
          <UserRound className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/90 ring-1 ring-black/10"
          aria-label="Open authentication"
        >
          <UserRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-transparent p-0 shadow-none sm:max-w-[960px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in, register, or reset your password.
          </DialogDescription>
        </DialogHeader>
        <AuthExperience compact nextPath="/account" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
