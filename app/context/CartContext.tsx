'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cartItemsCount: number;
  updateCartCount: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItemsCount: 0,
  updateCartCount: async () => {},
  isLoading: false,
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const updateCartCount = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching cart data...');
      const response = await fetch('/api/cart', { 
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      // If user is not authenticated, just set cart count to 0 and don't treat as error
      if (response.status === 401) {
        console.log('User not authenticated, empty cart');
        setCartItemsCount(0);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        console.warn('Non-OK response from cart API:', response.status);
        setCartItemsCount(0);
        setIsLoading(false);
        return;
      }
      
      // Safely parse the JSON response with error handling
      let data;
      try {
        const text = await response.text();
        console.log('Cart API response:', text);
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Error parsing cart response:', parseError);
        setCartItemsCount(0);
        setIsLoading(false);
        return;
      }
      
      // Calculate total items (sum of all quantities)
      if (data && data.items) {
        const totalItems = data.items.reduce((total: number, item: any) => total + item.quantity, 0);
        console.log('Total cart items:', totalItems);
        setCartItemsCount(totalItems);
      } else {
        console.log('No items in cart or invalid cart data');
        setCartItemsCount(0);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
      // Don't show errors to users, just set cart to empty
      setCartItemsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize cart count on mount only in client-side environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add a small delay to ensure authentication is initialized
      const timer = setTimeout(() => {
        updateCartCount();
      }, 1000); // Increase delay to 1000ms to ensure auth is ready
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartItemsCount, updateCartCount, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}; 