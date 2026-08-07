"use client";

import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthModalStore } from "@/store/auth-modal-store";

export function UserAuthButton() {
  const openModal = useAuthModalStore((state) => state.openModal);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full bg-white/90 ring-1 ring-black/10 cursor-pointer"
      onClick={() => openModal("login")}
      aria-label="Open authentication"
    >
      <UserRound className="h-4 w-4" />
    </Button>
  );
}
