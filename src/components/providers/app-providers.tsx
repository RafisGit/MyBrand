"use client";

import { Toaster } from "sonner";
import { GlobalAuthModal } from "@/components/auth/global-auth-modal";
import { LenisProvider } from "@/components/providers/lenis-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      {children}
      <GlobalAuthModal />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          style: {
            background: "#0a0a0a",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />
    </LenisProvider>
  );
}
