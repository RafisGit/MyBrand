"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, Product } from "@/types";

interface AddToCartPayload {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  addItem: (payload: AddToCartPayload) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number,
  ) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  setHydrated: (value: boolean) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      addItem: ({ product, quantity, size, color }) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.productId === product.id &&
              item.size === size &&
              item.color === color,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item === existingItem
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images[0],
                price: product.price,
                size,
                color,
                quantity,
              },
            ],
          };
        }),
      updateQuantity: (productId, size, color, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId &&
              item.size === size &&
              item.color === color
                ? { ...item, quantity: Math.max(1, quantity) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.size === size &&
                item.color === color
              ),
          ),
        })),
      clearCart: () => set({ items: [] }),
      setHydrated: (value) => set({ hydrated: value }),
      getSubtotal: () =>
        get().items.reduce(
          (runningTotal, item) => runningTotal + item.price * item.quantity,
          0,
        ),
      getItemCount: () =>
        get().items.reduce(
          (runningQuantity, item) => runningQuantity + item.quantity,
          0,
        ),
    }),
    {
      name: "mybrand-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
