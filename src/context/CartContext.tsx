'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Menu } from '@/lib/supabase';

export interface CartItem {
  menu: Menu;
  quantity: number;
  spiceLevel: number;
  notes: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (menu: Menu, quantity: number, spiceLevel: number, notes: string) => void;
  updateQuantity: (menuId: string, spiceLevel: number, notes: string, quantity: number) => void;
  removeFromCart: (menuId: string, spiceLevel: number, notes: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState<string>('');
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  // Load cart and table number from localStorage on client side mount
  useEffect(() => {
    const savedCart = localStorage.getItem('smart_restaurant_cart');
    const savedTable = localStorage.getItem('smart_restaurant_table');
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
    
    if (savedTable) {
      setTableNumberState(savedTable);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('smart_restaurant_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const setTableNumber = (table: string) => {
    setTableNumberState(table);
    localStorage.setItem('smart_restaurant_table', table);
  };

  const addToCart = (menu: Menu, quantity: number, spiceLevel: number, notes: string) => {
    setCartItems((prevItems) => {
      // Find if item with same ID, spice level, and notes already exists
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.menu.id === menu.id &&
          item.spiceLevel === spiceLevel &&
          item.notes.trim() === notes.trim()
      );

      if (existingItemIndex > -1) {
        // Increment quantity of existing matching item
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
        return newItems;
      } else {
        // Add as a new individual item
        return [...prevItems, { menu, quantity, spiceLevel, notes }];
      }
    });
  };

  const updateQuantity = (menuId: string, spiceLevel: number, notes: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId, spiceLevel, notes);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.menu.id === menuId && item.spiceLevel === spiceLevel && item.notes.trim() === notes.trim()
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (menuId: string, spiceLevel: number, notes: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.menu.id === menuId &&
            item.spiceLevel === spiceLevel &&
            item.notes.trim() === notes.trim()
          )
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Compute stats
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.menu.price) * item.quantity, 0);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        tableNumber,
        setTableNumber,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
