'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '@/lib/utils';

export default function CartIcon({ isLink = true }: { isLink?: boolean }) {
  const { cartItemsCount } = useCart();
  
  const content = (
    <>
      <ShoppingBag className="h-6 w-6 text-white" />
      {cartItemsCount > 0 && (
        <span className={cn(
          "absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
          "bg-teal-600 text-white"
        )}>
          {cartItemsCount > 99 ? '99+' : cartItemsCount}
        </span>
      )}
    </>
  );
  
  if (isLink) {
    return (
      <Link 
        href="/cart" 
        className="relative inline-flex items-center justify-center"
      >
        {content}
      </Link>
    );
  }
  
  return (
    <div className="relative inline-flex items-center justify-center">
      {content}
    </div>
  );
} 