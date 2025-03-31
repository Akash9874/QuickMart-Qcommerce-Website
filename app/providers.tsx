'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import ToastContainer from './components/ToastContainer';
import { CartProvider } from './context/CartContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>
        <ToastContainer>
          {children}
        </ToastContainer>
      </CartProvider>
    </SessionProvider>
  );
} 