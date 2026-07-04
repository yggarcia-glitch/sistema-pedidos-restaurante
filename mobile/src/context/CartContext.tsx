import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { cartApi } from '@/src/api/cart.api';
import { Cart, Product, Role } from '@/src/types';
import { useAuth } from '@/src/hooks/useAuth';
import { confirmAction } from '@/src/utils/dialog';

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  subtotal: number;
  restaurantId: string | null;
  restaurantName: string | null;
  fetchCart: () => Promise<void>;
  addItem: (
    product: Product,
    quantity: number,
    choiceIds?: string[],
    notes?: string,
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await cartApi.get();
      setCart(data);
    } catch {
      setCart(null);
    }
  }, []);

  // Sincroniza el carrito con el backend sólo para clientes autenticados.
  useEffect(() => {
    if (isAuthenticated && user?.rol?.nombre === Role.CLIENTE) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user, fetchCart]);

  // Ejecuta el alta del ítem en el backend y refresca el carrito.
  const doAdd = useCallback(
    async (product: Product, quantity: number, choiceIds: string[], notes: string) => {
      setLoading(true);
      try {
        await cartApi.addItem({ productId: product.id, quantity, choiceIds, notes });
        await fetchCart();
      } finally {
        setLoading(false);
      }
    },
    [fetchCart],
  );

  // addItem: si el producto pertenece a OTRO restaurante distinto al del carrito
  // actual, muestra un Alert nativo de confirmación antes de vaciar el carrito.
  const addItem = useCallback(
    async (
      product: Product,
      quantity: number,
      choiceIds: string[] = [],
      notes = '',
    ) => {
      const currentRestaurant = cart?.restaurantId;
      const hasItems = (cart?.items?.length ?? 0) > 0;

      if (hasItems && currentRestaurant && currentRestaurant !== product.restaurantId) {
        // Confirmación nativa (o window.confirm en web) antes de vaciar el carrito.
        confirmAction(
          'Vaciar carrito',
          'Tu carrito tiene productos de otro restaurante. ¿Deseas vaciarlo y agregar este producto?',
          async () => {
            await cartApi.clear();
            await doAdd(product, quantity, choiceIds, notes);
          },
          { confirmText: 'Vaciar y agregar', destructive: true },
        );
        return;
      }
      await doAdd(product, quantity, choiceIds, notes);
    },
    [cart, doAdd],
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      setLoading(true);
      try {
        await cartApi.updateItem(itemId, { quantity });
        await fetchCart();
      } finally {
        setLoading(false);
      }
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setLoading(true);
      try {
        await cartApi.removeItem(itemId);
        await fetchCart();
      } finally {
        setLoading(false);
      }
    },
    [fetchCart],
  );

  const clearCart = useCallback(async () => {
    setLoading(true);
    try {
      await cartApi.clear();
      await fetchCart();
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Totales derivados de los ítems (los Decimal llegan como string -> Number()).
  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const subtotal =
    cart?.items?.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        subtotal,
        restaurantId: cart?.restaurantId ?? null,
        restaurantName: cart?.restaurant?.name ?? null,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
