import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from "sonner"
import { type ThemeColor } from '@/lib/utils'

// Define the shape of an item in the cart
export interface CartItem {
  id: string;
  title: string;
  price: string;
  icon: string;
  quantity: number;
  whatYouGet: string[]; // Added to store details
  // Drift experience specific fields
  additionalItems?: string[]; // IDs of selected additional items
  selectedLocation?: string | null; // Selected location ID
  selectedVoucher?: string | null; // Selected voucher ID
  experienceSlug?: string; // Slug for the experience
  imageUrl?: string; // Image URL for display
  themeColor?: ThemeColor; // Theme color for styling
  voucherName?: string; // Recipient name for gift vouchers
}

// Define the state and actions for the cart store
interface CartState {
  items: CartItem[]
  // Drift experience selections (temporary, before adding to cart)
  driftSelections: {
    [experienceId: string]: {
      additionalItems: string[];
      selectedLocation: string | null;
    }
  }
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (itemId: string) => void
  increaseQuantity: (itemId: string) => void
  decreaseQuantity: (itemId: string) => void
  clearCart: () => void
  // Drift experience actions
  updateDriftSelections: (experienceId: string, additionalItems: string[], selectedLocation: string | null) => void
  toggleCartItemAdditional: (itemId: string, additionalItemId: string) => void
  updateCartItemLocation: (itemId: string, locationId: string) => void
  updateCartItemVoucher: (itemId: string, voucherId: string) => void
  updateCartItemVoucherName: (itemId: string, voucherName: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      driftSelections: {},
      addItem: (item) => {
        const currentItems = get().items
        const existingItemIndex = currentItems.findIndex((i) => i.id === item.id)

        if (existingItemIndex !== -1) {
          // Item exists, just increase quantity
          const updatedItems = [...currentItems]
          updatedItems[existingItemIndex].quantity += 1
          set({ items: updatedItems })
          toast.success(`Количеството е обновено`)
        } else {
          // New item, add it with quantity 1
          set({ items: [...currentItems, { ...item, quantity: 1 }] })
          toast.success(`Добавено`)
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) })
        toast.info(`Item removed from cart.`)
      },
      increaseQuantity: (itemId) => {
        const updatedItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        )
        set({ items: updatedItems })
      },
      decreaseQuantity: (itemId) => {
        const updatedItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
        )
        set({ items: updatedItems })
      },
      clearCart: () => set({ items: [] }),
      updateDriftSelections: (experienceId, additionalItems, selectedLocation) => {
        set({
          driftSelections: {
            ...get().driftSelections,
            [experienceId]: { additionalItems, selectedLocation }
          }
        })
      },
      toggleCartItemAdditional: (itemId, additionalItemId) => {
        const updatedItems = get().items.map((item) => {
          if (item.id === itemId) {
            const currentAdditionals = item.additionalItems || [];
            const isCurrentlySelected = currentAdditionals.includes(additionalItemId);

            if (isCurrentlySelected) {
              // Remove the item
              toast.info(`Премахнато допълнение`);
              return {
                ...item,
                additionalItems: currentAdditionals.filter(id => id !== additionalItemId)
              };
            } else {
              // Add the item
              toast.success(`Добавено допълнение`);
              return {
                ...item,
                additionalItems: [...currentAdditionals, additionalItemId]
              };
            }
          }
          return item;
        });
        set({ items: updatedItems });
      },
      updateCartItemLocation: (itemId, locationId) => {
        const updatedItems = get().items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              selectedLocation: locationId
            };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      updateCartItemVoucher: (itemId, voucherId) => {
        const updatedItems = get().items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              selectedVoucher: voucherId
            };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      updateCartItemVoucherName: (itemId, voucherName) => {
        const updatedItems = get().items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              voucherName: voucherName
            };
          }
          return item;
        });
        set({ items: updatedItems });
      },
    }),
    {
      name: 'cart-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)