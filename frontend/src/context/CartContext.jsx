import { createContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart.api';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sincroniza carrito con el backend cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENTE') {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user]);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await cartApi.get();
      setCart(data);
    } catch {
      setCart(null);
    }
  }, []);

  const addItem = useCallback(
    async (productId, quantity, choiceIds = [], notes = '') => {
      setLoading(true);
      try {
        await cartApi.addItem({ productId, quantity, choiceIds, notes });
        await fetchCart();
      } finally {
        setLoading(false);
      }
    },
    [fetchCart],
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
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
    async (itemId) => {
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

  // Calcula totales desde los items del carrito
  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const subtotal = cart?.items?.reduce(
    (s, i) => s + Number(i.unitPrice) * i.quantity,
    0,
  ) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, subtotal, fetchCart, addItem, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
