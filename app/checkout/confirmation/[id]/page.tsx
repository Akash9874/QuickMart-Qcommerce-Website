'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface OrderItem {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    image: string | null;
  };
  store?: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// For client component pages, we don't need to rely on the params prop
export default function OrderConfirmationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = typeof params?.id === 'string' ? params.id : '';
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }
    
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout/confirmation/' + orderId);
      return;
    }

    if (status === 'authenticated') {
      fetchOrderDetails();
    }
  }, [status, router, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view this order');
        }
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading order data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(date);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-2xl font-bold">Order Confirmation</h1>
        <div className="flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-2xl font-bold">Order Confirmation</h1>
        <div className="rounded bg-red-100 p-4 text-red-700">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/orders" className="text-[#1A535C] hover:underline">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="mb-2 text-3xl font-bold text-[#1A535C]">Order Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>
        
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Order Information</h2>
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-medium">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
          
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex py-4">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {item.product ? item.product.name : `Product #${item.productId}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.store ? `Sold by: ${item.store.name}` : `Store #${item.storeId}`}
                  </p>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                    <span>Quantity: {item.quantity}</span>
                    <span>×</span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-8 rounded-lg border bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">What's Next?</h2>
          <ul className="ml-5 list-disc space-y-2 text-gray-600">
            <li>You'll receive an email confirmation shortly.</li>
            <li>Your order is now being processed.</li>
            <li>You can track the status of your order in the Orders section of your account.</li>
          </ul>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link href="/orders" className="btn btn-primary">
            View Your Orders
          </Link>
          <Link href="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 