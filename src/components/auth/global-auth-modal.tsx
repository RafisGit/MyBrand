"use client";

import { useAuthModalStore } from "@/store/auth-modal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthExperience } from "@/features/auth/components/auth-experience";

export function GlobalAuthModal() {
  const { isOpen, mode, setIsOpen, closeModal } = useAuthModalStore();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-transparent p-0 shadow-none sm:max-w-[960px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in, register, or reset your password.
          </DialogDescription>
        </DialogHeader>
        <AuthExperience compact defaultMode={mode} nextPath="/account" onSuccess={closeModal} />
      </DialogContent>
    </Dialog>
  );
}
