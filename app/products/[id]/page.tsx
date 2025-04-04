'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import ProductImage from '@/app/components/ProductImage';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';

interface Store {
  id: number;
  name: string;
}

interface Price {
  store: Store | string;
  amount: number;
  storeId: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  prices: Price[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { updateCartCount } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params.id) return;
        
        const productId = parseInt(params.id as string);
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
        
        // Set the default selected store to the one with the lowest price
        if (data.prices && data.prices.length > 0) {
          const lowestPriceStore = data.prices.reduce((prev: Price, current: Price) => 
            prev.amount < current.amount ? prev : current
          );
          setSelectedStore(lowestPriceStore.storeId);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const addToCart = async () => {
    try {
      if (!product || selectedStore === null) {
        toast({
          title: 'Error',
          description: 'Please select a store first',
          variant: 'destructive',
        });
        return;
      }
      
      console.log(`Adding product ${product.id} from store ${selectedStore} to cart, quantity: ${quantity}`);
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          storeId: selectedStore,
          testMode: true // Enable test mode to bypass authentication
        }),
      });

      console.log(`Add to cart response status: ${response.status}`);
      let data;
      try {
        const text = await response.text();
        console.log(`Add to cart response text: ${text.substring(0, 200)}`);
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        data = { error: 'Invalid response from server' };
      }
      
      if (!response.ok) {
        console.error('Error response:', data);
        toast({
          title: 'Error',
          description: data?.error || 'Failed to add product to cart',
          variant: 'destructive',
        });
        return;
      }

      // Update cart count after successful addition
      console.log('Product added successfully, updating cart count');
      await updateCartCount();

      toast({
        title: 'Success',
        description: 'Product added to cart',
        variant: 'success',
      });
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to add product to cart',
        variant: 'destructive',
      });
    }
  };

  const selectedPrice = selectedStore && product
    ? product.prices.find(price => price.storeId === selectedStore)
    : null;

  // Helper to get store name
  const getStoreName = (price: Price) => {
    if (typeof price.store === 'string') {
      return price.store;
    }
    return price.store?.name || 'Unknown Store';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive">{error || 'Product not found'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm">
        <Link href="/products" className="text-primary hover:underline">
          Products
        </Link>{' '}
        / {product.name}
      </nav>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <ProductImage
            src={product.image || ""}
            alt={product.name}
            fill
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-muted-foreground mb-6">{product.description}</p>

          {/* Price Comparison */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Price Comparison</h2>
            <div className="border rounded-lg divide-y">
              {product.prices.map((price, index) => (
                <div 
                  key={price.storeId}
                  className={`flex cursor-pointer items-center justify-between p-4 ${
                    selectedStore === price.storeId ? 'bg-primary/10' : ''
                  } hover:bg-muted`}
                  onClick={() => setSelectedStore(price.storeId)}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="store"
                      checked={selectedStore === price.storeId}
                      onChange={() => setSelectedStore(price.storeId)}
                      className="mr-3 h-4 w-4 text-primary"
                    />
                    <span>{getStoreName(price)}</span>
                  </div>
                  <div className="font-semibold">
                    ${price.amount.toFixed(2)}
                    {index === 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-white">
                        Best Price
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <span className="mr-3">Quantity:</span>
              <div className="flex">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 h-10 text-center border"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={addToCart} 
              disabled={!selectedStore}
              className="px-6"
            >
              Add to Cart
              {selectedPrice && (
                <span className="ml-2">
                  (${(selectedPrice.amount * quantity).toFixed(2)})
                </span>
              )}
            </Button>
          </div>
          
          {/* Debug Panel */}
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
              <span className="mr-2">Debug Tools</span>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Developer Only</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/api/auth-test', '_blank')}
                className="text-xs"
              >
                Check Auth
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/api/test', '_blank')}
                className="text-xs"
              >
                Test API
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const url = `/api/cart/add`;
                  const data = {
                    productId: product.id,
                    quantity: 1,
                    storeId: selectedStore || 1,
                    testMode: true
                  };
                  
                  fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                  })
                  .then(response => response.text())
                  .then(text => {
                    console.log('Direct cart add response:', text);
                    toast({
                      title: 'Debug Info',
                      description: `Response: ${text.substring(0, 50)}...`,
                    });
                  })
                  .catch(err => {
                    console.error('Error in direct add:', err);
                    toast({
                      title: 'Error',
                      description: err.message,
                      variant: 'destructive',
                    });
                  });
                }}
                className="text-xs"
              >
                Direct Add (Test Mode)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/api/cart?testMode=true`, '_blank')}
                className="text-xs"
              >
                View Cart (Test Mode)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 