import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from "sonner"
import { type ThemeColor } from '@/lib/utils'

// Define the shape of an item in the cart
export interface CartItem {
  id: string; // Product ID
  cartItemId: string; // Unique ID for this cart item (includes variant info)
  title: string;
  price: number; // Changed to number for consistency
  icon?: string; // Made optional for physical products
  quantity: number;
  whatYouGet?: string[]; // Made optional

  // Product type discriminator
  productType: 'physical' | 'experience';

  // Physical product specific fields
  selectedVariant?: {
    options: Record<string, string>;
    sku?: string;
  };

  // Drift experience specific fields
  additionalItems?: string[]; // IDs of selected additional items
  selectedLocation?: string | null; // Selected location ID
  selectedVoucher?: string | null; // Selected voucher ID
  experienceSlug?: string; // Slug for the experience
  imageUrl?: string; // Image URL for display
  themeColor?: ThemeColor; // Theme color for styling
  voucherName?: string; // Recipient name for gift vouchers
  selectedDate?: string; // Selected preferred date (ISO string)

  // CMS experience stored addon data (for display without lookup)
  storedAddons?: {
    id: string;
    name: string;
    price: number;
    icon?: string;
    type: 'standard' | 'location' | 'voucher';
    googleMapsUrl?: string;
  }[];
  storedLocationName?: string; // Display name of selected location
  storedVoucherName?: string; // Display name of selected voucher
  storedLocationUrl?: string; // Google Maps URL for selected location
  storedSelectedDate?: string; // Display string for selected date
}

// Helper function to generate unique cart item ID
function generateCartItemId(item: Omit<CartItem, 'quantity' | 'cartItemId'>): string {
  if (item.productType === 'physical' && item.selectedVariant?.options) {
    // For physical products, include variant options in the ID
    const optionsStr = Object.entries(item.selectedVariant.options)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|')
    return `${item.id}__${optionsStr}`
  }
  // For experiences or products without variants, just use product ID
  return item.id
}

// Define the state and actions for the cart store
interface CartState {
  items: CartItem[]
  // Drift experience selections (temporary, before adding to cart)
  driftSelections: {
    [experienceId: string]: {
      additionalItems: string[];
      selectedLocation: string | null;
      selectedDate: string | null;
    }
  }
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void
  removeItem: (cartItemId: string) => void
  increaseQuantity: (cartItemId: string) => void
  decreaseQuantity: (cartItemId: string) => void
  clearCart: () => void
  // Drift experience actions
  updateDriftSelections: (experienceId: string, additionalItems: string[], selectedLocation: string | null, selectedDate?: string | null) => void
  toggleCartItemAdditional: (cartItemId: string, additionalItemId: string) => void
  updateCartItemLocation: (cartItemId: string, locationId: string) => void
  updateCartItemVoucher: (cartItemId: string, voucherId: string) => void
  updateCartItemVoucherName: (cartItemId: string, voucherName: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      driftSelections: {},
      addItem: (item) => {
        const currentItems = get().items
        const cartItemId = generateCartItemId(item)

        // Find existing item by cartItemId
        const existingItemIndex = currentItems.findIndex((i) => i.cartItemId === cartItemId)

        if (existingItemIndex !== -1) {
          // Item exists with same variant, just increase quantity
          const updatedItems = [...currentItems]
          updatedItems[existingItemIndex].quantity += 1
          set({ items: updatedItems })
          toast.success(`Количеството е обновено`)
        } else {
          // New item or different variant, add it with quantity 1 and generated cartItemId
          set({ items: [...currentItems, { ...item, cartItemId, quantity: 1 }] })
          toast.success(`Добавено`)
        }
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) })
        toast.info(`Item removed from cart.`)
      },
      increaseQuantity: (cartItemId) => {
        const updatedItems = get().items.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        )
        set({ items: updatedItems })
      },
      decreaseQuantity: (cartItemId) => {
        const updatedItems = get().items.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
        )
        set({ items: updatedItems })
      },
      clearCart: () => set({ items: [] }),
      updateDriftSelections: (experienceId, additionalItems, selectedLocation, selectedDate) => {
        const currentSelections = get().driftSelections[experienceId] || { additionalItems: [], selectedLocation: null, selectedDate: null }
        set({
          driftSelections: {
            ...get().driftSelections,
            [experienceId]: {
              additionalItems,
              selectedLocation,
              selectedDate: selectedDate !== undefined ? selectedDate : currentSelections.selectedDate
            }
          }
        })
      },
      toggleCartItemAdditional: (cartItemId, additionalItemId) => {
        const updatedItems = get().items.map((item) => {
          if (item.cartItemId === cartItemId) {
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
      updateCartItemLocation: (cartItemId, locationId) => {
        const updatedItems = get().items.map((item) => {
          if (item.cartItemId === cartItemId) {
            return {
              ...item,
              selectedLocation: locationId
            };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      updateCartItemVoucher: (cartItemId, voucherId) => {
        const updatedItems = get().items.map((item) => {
          if (item.cartItemId === cartItemId) {
            return {
              ...item,
              selectedVoucher: voucherId
            };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      updateCartItemVoucherName: (cartItemId, voucherName) => {
        const updatedItems = get().items.map((item) => {
          if (item.cartItemId === cartItemId) {
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