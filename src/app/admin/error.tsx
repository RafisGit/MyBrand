"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Console Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-red-500/20 bg-[#121212] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#f7f2eb]">
            Admin Console Error
          </h2>
          <p className="text-sm text-[#a79f92]">
            {error.message && !error.message.includes("digest")
              ? error.message
              : "Unable to load admin console data. You may need to sign in with admin privileges."}
          </p>
          {error.digest && (
            <p className="text-xs text-stone-500 font-mono">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-[#d4af37] text-black hover:bg-[#b5942b] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Admin
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2 border-white/10 bg-white/5 text-[#f5efe7] hover:bg-white/10 hover:text-white"
          >
            <Link href="/auth/login?next=/admin">
              <LogIn className="h-4 w-4" />
              Admin Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
