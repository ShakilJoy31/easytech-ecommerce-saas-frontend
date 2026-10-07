// store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  title: string;
  slug: string;
  price: number;
  currency: string;
  thumbnail: string | null;
  quantity: number;
  storeId: number;
  storeName: string;
  storeSlug: string;
  maxStock: number | null; // null = unlimited
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getStoreCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );

          if (existing) {
            const newQty = existing.quantity + quantity;
            const capped =
              existing.maxStock !== null
                ? Math.min(newQty, existing.maxStock)
                : newQty;
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: capped }
                  : i
              ),
            };
          }

          const capped =
            item.maxStock !== null
              ? Math.min(quantity, item.maxStock)
              : quantity;

          return {
            items: [...state.items, { ...item, quantity: capped }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: state.items.map((i) => {
              if (i.productId !== productId) return i;
              const capped =
                i.maxStock !== null ? Math.min(quantity, i.maxStock) : quantity;
              return { ...i, quantity: capped };
            }),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
      },

      getStoreCount: () => {
        const set_ = new Set(get().items.map((i) => i.storeId));
        return set_.size;
      },
    }),
    {
      name: "storefront-cart",
    }
  )
);