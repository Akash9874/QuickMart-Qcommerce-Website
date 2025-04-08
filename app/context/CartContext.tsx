'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getCart } from '@/app/lib/cart';

interface CartContextType {
  cartItemsCount: number;
  updateCartCount: () => Promise<void>;
  isLoading: boolean;
}

// Default context values
const defaultCartContext: CartContextType = {
  cartItemsCount: 0,
  updateCartCount: async () => {},
  isLoading: true,
};

// Create context
const CartContext = createContext<CartContextType>(defaultCartContext);

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // Function to update cart count from the server
  const updateCartCount = async () => {
    try {
      console.log("CartContext: Updating cart count");
      
      if (status === 'loading') {
        console.log("CartContext: Session loading, deferring cart update");
        setIsLoading(true);
        return;
      }
      
      // First, try to get cart data from localStorage
      const localCart = getCart();
      if (localCart && localCart.length > 0) {
        console.log(`CartContext: Found ${localCart.length} items in localStorage`);
        
        // Calculate total quantity from localStorage cart
        const totalItems = localCart.reduce((total, item) => {
          return total + (item.quantity || 0);
        }, 0);
        
        console.log(`CartContext: Setting cart count to ${totalItems} items from localStorage`);
        setCartItemsCount(totalItems);
        setIsLoading(false);
        return;
      }
      
      // If no localStorage cart, try to fetch from server (for backward compatibility)
      console.log("CartContext: No localStorage cart, fetching from server with test mode");
      
      // Get cart data from localStorage to pass to the API
      const cartData = typeof window !== 'undefined' ? localStorage.getItem('quickmart_cart') : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      // Add cart data to headers if available
      if (cartData) {
        headers['x-cart-data'] = cartData;
      }
      
      const response = await fetch('/api/cart?testMode=true', {
        headers
      });
      
      if (!response.ok) {
        console.error("CartContext: Error fetching cart, status:", response.status);
        setCartItemsCount(0);
        setIsLoading(false);
        return;
      }

      let data;
      try {
        data = await response.json();
        console.log("CartContext: Cart data received:", data ? "Success" : "Empty data");
      } catch (error) {
        console.error("CartContext: Error parsing cart data:", error);
        setCartItemsCount(0);
        setIsLoading(false);
        return;
      }

      if (data && data.items && Array.isArray(data.items)) {
        // Calculate total quantity of all items
        const totalItems = data.items.reduce((total: number, item: any) => {
          return total + (item.quantity || 0);
        }, 0);
        
        console.log(`CartContext: Setting cart count to ${totalItems} items from API`);
        setCartItemsCount(totalItems);
      } else {
        console.log("CartContext: No cart items found, setting count to 0");
        setCartItemsCount(0);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("CartContext: Error updating cart count:", error);
      setCartItemsCount(0);
      setIsLoading(false);
    }
  };

  // Update cart count on mount and when session changes
  useEffect(() => {
    console.log(`CartContext: Session status is ${status}`);
    const timer = setTimeout(() => {
      updateCartCount();
    }, 500); // Slight delay to ensure authentication is initialized
    
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <CartContext.Provider
      value={{
        cartItemsCount,
        updateCartCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 