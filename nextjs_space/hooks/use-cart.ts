'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/lib/types';
import { toast } from 'sonner';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId: number) => void;
  updateQuantity: (productId: number, variantId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemsCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingItem = items?.find(
          (i) => i?.productId === item?.productId && i?.variantId === item?.variantId
        );

        if (existingItem) {
          set({
            items: items?.map((i) =>
              i?.productId === item?.productId && i?.variantId === item?.variantId
                ? { ...i, quantity: (i?.quantity ?? 0) + (item?.quantity ?? 1) }
                : i
            ) ?? [],
          });
          toast.success('Quantidade atualizada no carrinho!');
        } else {
          set({ items: [...(items ?? []), item] });
          toast.success('Produto adicionado ao carrinho!');
        }
      },
      removeItem: (productId, variantId) => {
        const items = get().items;
        set({
          items: items?.filter(
            (i) => !(i?.productId === productId && i?.variantId === variantId)
          ) ?? [],
        });
        toast.success('Produto removido do carrinho');
      },
      updateQuantity: (productId, variantId, quantity) => {
        const items = get().items;
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: items?.map((i) =>
            i?.productId === productId && i?.variantId === variantId
              ? { ...i, quantity }
              : i
          ) ?? [],
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items;
        return items?.reduce((total, item) => total + ((item?.price ?? 0) * (item?.quantity ?? 0)), 0) ?? 0;
      },
      getItemsCount: () => {
        const items = get().items;
        return items?.reduce((count, item) => count + (item?.quantity ?? 0), 0) ?? 0;
      },
    }),
    {
      name: 'titanium-cart',
    }
  )
);
