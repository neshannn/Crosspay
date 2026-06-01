'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { addToCart, getCartItems, removeFromCart, updateCartItemQuantity, clearCart } from '@/lib/cart-actions';
import { Service } from '@/lib/types';
import { useToast } from '../ui/Toast';

interface CartItem {
  id: string;
  quantity: number;
  service: Service;
}

interface CartContextType {
  items: CartItem[];
  addItem: (service: Service, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    const cartItems = await getCartItems();
    // @ts-ignore - Drizzle output mapping
    setItems(cartItems);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (service: Service, quantity: number = 1) => {
    const result = await addToCart(service.id, quantity);
    if (result.success) {
      await refreshCart();
      setIsOpen(true);
      showToast(`${service.name} added to cart`, 'success');
    } else {
      showToast(result.error || 'Failed to add item', 'error');
    }
  };

  const removeItem = async (id: string) => {
    const result = await removeFromCart(id);
    if (result.success) {
      await refreshCart();
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const result = await updateCartItemQuantity(id, quantity);
    if (result.success) {
      await refreshCart();
    }
  };

  const clear = async () => {
    const result = await clearCart();
    if (result.success) {
      setItems([]);
    }
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clear, 
      isOpen, 
      setIsOpen, 
      isLoading,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
