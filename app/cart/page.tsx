'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import ProductImage from '@/app/components/ProductImage';
import { useCart } from '@/app/context/CartContext';
import { getCart as getCartFromStorage, addToCart as addToCartInStorage, updateCartItemQuantity, removeCartItem } from '@/app/lib/cart';
import { mockProducts, mockPrices, mockStores } from '@/app/lib/mockData';
import Link from 'next/link';

interface CartItem {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    image: string | null;
    price: number;
    store?: {
      id?: string;
      name?: string;
    };
  };
}

interface Cart {
  items: CartItem[];
  total: number;
}

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { updateCartCount } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCartFromStorage();
  }, []);

  const fetchCartFromStorage = () => {
    try {
      setIsLoading(true);
      
      // Get cart from localStorage
      const cartItems = getCartFromStorage();
      console.log('Cart items from localStorage:', cartItems);
      
      if (!cartItems || cartItems.length === 0) {
        setCart({ items: [], total: 0 });
        setIsLoading(false);
        return;
      }
      
      // Format cart items for display
      const formattedItems = cartItems.map(item => {
        // Get product details
        const product = mockProducts.find(p => p.id === item.productId) || 
          (item.product || { name: 'Unknown Product', description: '', image: null });
        
        // Get price details
        const price = mockPrices.find(p => p.productId === item.productId && p.storeId === item.storeId) || 
          (item.price || { amount: 0 });
          
        // Get store details
        const store = mockStores.find(s => s.id === item.storeId) || { id: item.storeId, name: 'Unknown Store' };
        
        // Calculate subtotal
        const priceAmount = price.amount || 0;
        
        return {
          id: item.id,
          productId: item.productId,
          storeId: item.storeId,
          quantity: item.quantity,
          product: {
            id: item.productId.toString(),
            name: product.name || 'Unknown Product',
            description: product.description || '',
            image: product.image || null,
            price: priceAmount,
            store: {
              id: store.id.toString(),
              name: store.name
            }
          }
        };
      });
      
      // Calculate total
      const total = formattedItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );
      
      setCart({ 
        items: formattedItems, 
        total 
      });
      
      console.log('Formatted cart:', { items: formattedItems, total });
    } catch (err) {
      console.error('Error fetching cart from localStorage:', err);
      setError('Failed to load cart. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1 || !cart) return;
    
    try {
      setIsUpdating(true);
      
      // Update item quantity using the cart library function
      updateCartItemQuantity(itemId, newQuantity);
      
      // Refresh cart display
      fetchCartFromStorage();
      await updateCartCount();
      
      toast({
        title: 'Cart updated',
        description: 'Quantity has been updated successfully.',
        variant: 'update',
      });
    } catch (err) {
      console.error('Error updating quantity:', err);
      toast({
        title: 'Error',
        description: 'Failed to update quantity. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!cart) return;
    
    try {
      setIsUpdating(true);
      
      // Remove item using the cart library function
      removeCartItem(itemId);
      
      // Refresh cart display
      fetchCartFromStorage();
      await updateCartCount();
      
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart.',
        variant: 'remove',
      });
    } catch (err) {
      console.error('Error removing item:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const createTestCart = async () => {
    try {
      setIsLoading(true);
      
      // Create test cart with mock products
      const testProducts = [
        { productId: 1, storeId: 3, quantity: 2 }, // Organic Bananas from ValuGrocer
        { productId: 2, storeId: 1, quantity: 1 }, // Whole Milk from FreshMart
        { productId: 4, storeId: 2, quantity: 3 }  // Eggs from QuickStop
      ];
      
      // Add each item to cart
      const cartItems = [];
      for (const item of testProducts) {
        const cartItem = addToCartInStorage(item.productId, item.storeId, item.quantity);
        if (cartItem) {
          cartItems.push(cartItem);
        }
      }
      
      // Refresh cart display
      fetchCartFromStorage();
      await updateCartCount();
      
      toast({
        title: 'Test cart created',
        description: 'A test cart has been created with sample products.',
      });
    } catch (err) {
      console.error('Error creating test cart:', err);
      toast({
        title: 'Error',
        description: 'Failed to create test cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchCartFromStorage}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/products')} className="w-full">
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  {item.product.image ? (
                    <ProductImage 
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.product.store?.name || 'Unknown Store'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.product.description}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Link 
              href="/checkout"
              className="w-full mt-6 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white py-3 px-4 rounded-md font-medium text-sm transition-colors block text-center"
            >
              Proceed to Checkout
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
} 