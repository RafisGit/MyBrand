"use client";

import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
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
    </>
  );
}
