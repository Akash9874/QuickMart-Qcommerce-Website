'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '../../components/LoadingSpinner';

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

export default function OrderDetails() {
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
      router.push('/login?callbackUrl=/orders/' + orderId);
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getProductImage = (product?: { name: string, image: string | null }) => {
    if (!product) return null;
    
    if (product.image) {
      return (
        <div className="relative h-16 w-16 overflow-hidden rounded">
          <Image
            src={`/products/${product.image}`}
            alt={product.name}
            fill
            sizes="64px"
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = `/placeholder.png`;
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-200 text-xl font-bold">
        {product.name.charAt(0)}
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-2xl font-bold">Order Details</h1>
        <div className="flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-2xl font-bold">Order Details</h1>
        <div className="rounded bg-red-100 p-4 text-red-700">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/orders" className="text-[#1A535C] hover:underline">
            ← Back to Orders
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <div className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
          {order.status}
        </div>
      </div>
      
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Order Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Date Placed:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span>{formatDate(order.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="rounded border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Delivery Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span>{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span>
                {order.status === 'DELIVERED' 
                  ? 'Delivered' 
                  : order.status === 'CANCELLED'
                  ? 'Cancelled'
                  : '3-5 business days'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6 rounded border bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Order Items</h2>
        
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 py-4">
              {item.product && getProductImage(item.product)}
              
              <div className="flex-1">
                <h3 className="font-medium">
                  {item.product ? item.product.name : `Product #${item.productId}`}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.store ? `Sold by: ${item.store.name}` : `Store #${item.storeId}`}
                </p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                  <span className="text-sm text-gray-600">×</span>
                  <span className="text-sm text-gray-600">${item.price.toFixed(2)}</span>
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
      
      <div className="flex justify-between">
        <Link href="/orders" className="rounded-full bg-white px-6 py-2 text-[#1A535C] shadow-sm hover:bg-gray-50">
          ← Back to Orders
        </Link>
        
        {order.status === 'DELIVERED' && (
          <button className="rounded-full bg-[#1A535C] px-6 py-2 text-white hover:bg-[#1A535C]/90">
            Leave a Review
          </button>
        )}
      </div>
    </div>
  );
} 