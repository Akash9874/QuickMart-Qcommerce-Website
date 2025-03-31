'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cartItemsCount: number;
  updateCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartItemsCount: 0,
  updateCartCount: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const updateCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      
      // Calculate total items (sum of all quantities)
      if (data && data.items) {
        const totalItems = data.items.reduce((total: number, item: any) => total + item.quantity, 0);
        setCartItemsCount(totalItems);
      } else {
        setCartItemsCount(0);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
      setCartItemsCount(0);
    }
  };

  // Initialize cart count on mount
  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartItemsCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
}; 