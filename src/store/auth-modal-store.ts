"use client";

import { create } from "zustand";

export type AuthMode = "login" | "register" | "reset";

interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
  openModal: (mode?: AuthMode) => void;
  closeModal: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useAuthModalStore = create<AuthModalState>()((set) => ({
  isOpen: false,
  mode: "login",
  openModal: (mode = "login") => set({ isOpen: true, mode }),
  closeModal: () => set({ isOpen: false }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
