'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  
  // Generate a random order number
  const orderNumber = `ORD-${Math.floor(Math.random() * 900000) + 100000}`;
  
  // Create a fake estimated delivery date (5-7 days from now)
  const deliveryDays = Math.floor(Math.random() * 3) + 5;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  // Redirect to home if user refreshes the success page
  useEffect(() => {
    const timeout = setTimeout(() => {
      // This timeout is to prevent immediate redirect if user arrives naturally
      const hasHistory = window.history && window.history.length > 1;
      
      if (!hasHistory) {
        router.push('/');
      }
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [router]);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your purchase. We&apos;re processing your order now.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Order number:</span>
              <span className="font-semibold">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated delivery:</span>
              <span className="font-semibold">{formattedDeliveryDate}</span>
            </div>
          </div>
          
          <p className="mb-8 text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
            <Link href="/orders">
              <Button className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                View Orders
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 