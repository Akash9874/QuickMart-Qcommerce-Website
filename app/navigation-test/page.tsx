'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NavigationTest() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Navigation Test Page</h1>
      <div className="flex flex-col gap-4">
        <Button 
          onClick={() => router.push('/')}
          className="w-full"
        >
          Go to Home
        </Button>
        
        <Button 
          onClick={() => router.push('/products')}
          className="w-full"
        >
          Go to Products
        </Button>
        
        <Button 
          onClick={() => router.push('/cart')}
          className="w-full"
        >
          Go to Cart
        </Button>
        
        <Button 
          onClick={() => {
            console.log("Navigating to checkout");
            router.push('/checkout');
          }}
          className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90"
        >
          Go to Checkout
        </Button>
        
        <Button 
          onClick={() => {
            console.log("Manually assigning window.location");
            window.location.href = '/checkout';
          }}
          className="w-full bg-amber-500 hover:bg-amber-600"
        >
          Go to Checkout (window.location)
        </Button>
      </div>
    </div>
  );
} 