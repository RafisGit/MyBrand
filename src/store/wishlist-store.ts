"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  toggleItem: (id: string) => void;
  hasItem: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggleItem: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((currentId) => currentId !== id)
            : [...state.ids, id],
        })),
      hasItem: (id) => get().ids.includes(id),
    }),
    {
      name: "mybrand-wishlist",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
