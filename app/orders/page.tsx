'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Package, ShoppingBag, ExternalLink, ChevronRight } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    image: string;
    price: number;
    store: {
      name: string;
    };
  };
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery: string;
}

// Mock data for orders - in a real app, this would come from your API
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-483921',
    date: '2023-11-15',
    status: 'delivered',
    total: 48.94,
    estimatedDelivery: 'November 18, 2023',
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'United States'
    },
    items: [
      {
        id: '1',
        productId: '1',
        product: {
          name: 'Organic Bananas',
          image: '/products/bananas.jpg',
          price: 1.99,
          store: {
            name: 'FreshMart'
          }
        },
        quantity: 2
      },
      {
        id: '2',
        productId: '2',
        product: {
          name: 'Whole Milk',
          image: '/products/milk.jpg',
          price: 3.49,
          store: {
            name: 'FreshMart'
          }
        },
        quantity: 1
      },
      {
        id: '3',
        productId: '3',
        product: {
          name: 'Bread',
          image: '/products/bread.jpg',
          price: 2.99,
          store: {
            name: 'ValuGrocer'
          }
        },
        quantity: 1
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-569872',
    date: '2023-11-22',
    status: 'shipped',
    total: 32.45,
    estimatedDelivery: 'November 25, 2023',
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'United States'
    },
    items: [
      {
        id: '4',
        productId: '4',
        product: {
          name: 'Eggs',
          image: '/products/eggs.jpg',
          price: 3.99,
          store: {
            name: 'QuickStop'
          }
        },
        quantity: 1
      },
      {
        id: '5',
        productId: '3',
        product: {
          name: 'Bread',
          image: '/products/bread.jpg',
          price: 2.99,
          store: {
            name: 'ValuGrocer'
          }
        },
        quantity: 2
      }
    ]
  }
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Simulate loading orders from an API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, this would be a fetch request to your API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(MOCK_ORDERS);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="text-center py-16 bg-light rounded-lg">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            {/* Order Header */}
            <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-sm text-gray-500">ORDER PLACED</p>
                <p className="font-medium">
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">ORDER #</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">TOTAL</p>
                <p className="font-medium">${order.total.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">STATUS</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="ml-auto"
                onClick={() => toggleOrderDetails(order.id)}
              >
                {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
              </Button>
            </div>
            
            {/* Order Details (Expandable) */}
            {expandedOrder === order.id && (
              <div className="p-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium mb-3">Items</h3>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} · ${item.product.price.toFixed(2)} each
                            </p>
                            <p className="text-sm text-gray-600">
                              Seller: {item.product.store.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Shipping Info */}
                  <div>
                    <h3 className="font-medium mb-3">Shipping Information</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                    
                    <h3 className="font-medium mt-4 mb-2">Delivery</h3>
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-600" />
                      <p>
                        {order.status === 'delivered' 
                          ? `Delivered on ${order.estimatedDelivery}` 
                          : `Estimated delivery: ${order.estimatedDelivery}`}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Track Package
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
} 