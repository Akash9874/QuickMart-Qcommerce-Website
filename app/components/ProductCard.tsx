'use client';

import Link from 'next/link';
import { memo, useState } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';
import { formatCurrency } from '@/app/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '../context/CartContext';

interface Store {
  id: number;
  name: string;
}

interface Price {
  store: string | Store;
  amount: number;
  storeId: number;
}

interface Product {
  id: number;
  name: string;
  image: string;
  description: string;
  prices: Price[];
}

interface ProductCardProps {
  product: Product;
}

// Memoize the ProductCard to prevent unnecessary re-renders
const ProductCard = memo(({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { updateCartCount } = useCart();

  // Find the lowest and highest price
  const { lowestPrice, highestPrice, storeName, lowestPriceStoreId } = product.prices.reduce(
    (prev, current) => {
      const currentAmount = current.amount;
      
      if (currentAmount < prev.lowestPrice) {
        return {
          lowestPrice: currentAmount,
          highestPrice: prev.highestPrice,
          storeName: typeof current.store === 'string' 
            ? current.store 
            : current.store?.name || 'Unknown Store',
          lowestPriceStoreId: current.storeId
        };
      } else if (currentAmount > prev.highestPrice) {
        return {
          lowestPrice: prev.lowestPrice,
          highestPrice: currentAmount,
          storeName: prev.storeName,
          lowestPriceStoreId: prev.lowestPriceStoreId
        };
      }
      
      return prev;
    },
    {
      lowestPrice: Infinity,
      highestPrice: -Infinity,
      storeName: '',
      lowestPriceStoreId: 0
    }
  );

  // Calculate savings percentage if there's a difference
  const hasPriceDifference = highestPrice > lowestPrice;
  const savingsPercent = hasPriceDifference
    ? Math.round(((highestPrice - lowestPrice) / highestPrice) * 100)
    : 0;

  // Function to add product to cart
  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          storeId: lowestPriceStoreId
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      // Update cart count after successful addition
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
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
    >
      {/* Favorite Button */}
      <button
        className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 shadow-sm transition-all duration-300 hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault();
          setIsFavorite(!isFavorite);
        }}
      >
        <Heart
          className={`h-5 w-5 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
          }`}
        />
      </button>

      {/* Savings Badge */}
      {hasPriceDifference && savingsPercent > 5 && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white">
          Save {savingsPercent}%
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <ProductImage
            src={product.image || ""}
            alt={product.name}
            className="h-full w-full"
            fill
          />
        </div>
      </Link>

      {/* Quick add to cart - appears on hover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 20 
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-x-0 bottom-[72px] mx-auto flex max-w-[80%] justify-center"
      >
        <button 
          className={`flex items-center justify-center gap-1.5 rounded-full ${
            isAddingToCart ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'
          } px-4 py-2 text-sm font-medium text-white transition-all`}
          onClick={addToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>Quick Add</span>
            </>
          )}
        </button>
      </motion.div>

      {/* Product Details */}
      <div className="p-4">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="mb-1 text-base font-medium text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          
          <p className="mb-3 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
          
          <div className="mb-1 flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 text-xs text-gray-500">(24)</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                ${lowestPrice.toFixed(2)}
              </span>
              
              {hasPriceDifference && (
                <span className="text-sm text-gray-500 line-through">
                  ${highestPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <span className="mt-1 text-xs text-gray-600">
              Best price at: {storeName}
            </span>
            
            <span className="mt-1 text-xs text-gray-500">
              {product.prices.length} stores available
            </span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 