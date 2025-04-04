'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/app/components/ProductCard';
import { Loader2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define interfaces to match the component expectations
interface Store {
  id: number;
  name: string;
}

interface Price {
  store: string;
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

// Mock data
const PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Bread',
    description: 'Freshly baked whole wheat bread. Made with 100% whole wheat flour.',
    image: 'bread.jpg',
    prices: [
      { store: 'FreshMart', amount: 2.99, storeId: 1 },
      { store: 'QuickStop', amount: 3.19, storeId: 2 },
      { store: 'ValuGrocer', amount: 2.79, storeId: 3 }
    ]
  },
  {
    id: 2,
    name: 'Whole Milk',
    description: 'Farm fresh whole milk, 1 gallon. Pasteurized for safety.',
    image: 'milk.jpg',
    prices: [
      { store: 'FreshMart', amount: 3.49, storeId: 1 },
      { store: 'QuickStop', amount: 3.29, storeId: 2 },
      { store: 'ValuGrocer', amount: 3.59, storeId: 3 }
    ]
  },
  {
    id: 3,
    name: 'Organic Eggs',
    description: 'Farm fresh organic eggs from free-range chickens. Dozen.',
    image: 'eggs.jpg',
    prices: [
      { store: 'FreshMart', amount: 3.99, storeId: 1 },
      { store: 'QuickStop', amount: 3.49, storeId: 2 },
      { store: 'ValuGrocer', amount: 3.79, storeId: 3 }
    ]
  },
  {
    id: 4,
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, perfect for smoothies or a quick snack.',
    image: 'bananas.jpg',
    prices: [
      { store: 'FreshMart', amount: 1.99, storeId: 1 },
      { store: 'QuickStop', amount: 2.49, storeId: 2 },
      { store: 'ValuGrocer', amount: 1.89, storeId: 3 }
    ]
  },
  {
    id: 5,
    name: 'Organic Chicken',
    description: 'Free-range organic chicken breast, 1 pound. No antibiotics or hormones.',
    image: 'chicken.jpg',
    prices: [
      { store: 'FreshMart', amount: 6.99, storeId: 1 },
      { store: 'QuickStop', amount: 6.49, storeId: 2 },
      { store: 'ValuGrocer', amount: 5.99, storeId: 3 }
    ]
  }
];

const stores = ['FreshMart', 'QuickStop', 'ValuGrocer'];
const categories = ['All', 'Fresh', 'Dairy', 'Meat', 'Produce', 'Bakery'];
const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Most Popular', 'Recently Added'];

// ProductSkeleton component for loading state
const ProductSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="aspect-square animate-pulse rounded-t-xl bg-gray-200"></div>
    <div className="p-4">
      <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
      <div className="mb-3 h-3 w-full animate-pulse rounded bg-gray-200"></div>
      <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
    </div>
  </div>
);

// Create a separate component for product content that uses searchParams
function ProductContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStore, setActiveStore] = useState('');
  const [activeSort, setActiveSort] = useState(sortOptions[0]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);

  useEffect(() => {
    // Simulate API fetch with delay
    const fetchProducts = async () => {
      setIsLoading(true);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Apply any filters from URL
      const category = searchParams.get('category') || 'All';
      if (category !== 'All') {
        setActiveCategory(category);
      }

      setProducts(PRODUCTS);
      setIsLoading(false);
    };

    fetchProducts();
  }, [searchParams]);

  // Filter products based on search, category, store, and price
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter - mock implementation, would connect to real categories
    const matchesCategory = activeCategory === 'All' || true;

    // Store filter
    const matchesStore = activeStore === '' ||
      product.prices.some(price => price.store === activeStore);

    // Price filter
    const lowestPrice = Math.min(...product.prices.map(p => p.amount));
    const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];

    return matchesSearch && matchesCategory && matchesStore && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aLowestPrice = Math.min(...a.prices.map(p => p.amount));
    const bLowestPrice = Math.min(...b.prices.map(p => p.amount));

    if (activeSort === 'Price: Low to High') {
      return aLowestPrice - bLowestPrice;
    } else if (activeSort === 'Price: High to Low') {
      return bLowestPrice - aLowestPrice;
    }
    // Other sort options would be implemented here
    return 0;
  });

  return (
    <div className="bg-gray-50 px-4 pb-16 pt-8 md:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mx-auto mb-12 max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Browse Our Products
        </h1>
        <p className="text-lg text-gray-600">
          Find the freshest groceries at the best prices from multiple stores
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="mb-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-primary focus:ring-primary"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              Filters
              {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <div className="p-4">
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Categories */}
                  <div>
                    <h3 className="mb-3 font-medium text-gray-900">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          className={`rounded-full px-3 py-1 text-sm ${activeCategory === category
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          onClick={() => setActiveCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stores */}
                  <div>
                    <h3 className="mb-3 font-medium text-gray-900">Stores</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={`rounded-full px-3 py-1 text-sm ${activeStore === ''
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        onClick={() => setActiveStore('')}
                      >
                        All Stores
                      </button>
                      {stores.map(store => (
                        <button
                          key={store}
                          className={`rounded-full px-3 py-1 text-sm ${activeStore === store
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          onClick={() => setActiveStore(store)}
                        >
                          {store}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="mb-3 font-medium text-gray-900">Price Range</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">${priceRange[0].toFixed(2)}</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseFloat(e.target.value), priceRange[1]])}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                      />
                      <span className="text-sm text-gray-500">${priceRange[1].toFixed(2)}</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value)])}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setActiveCategory('All');
                      setActiveStore('');
                      setPriceRange([0, 10]);
                    }}
                  >
                    Reset Filters
                  </button>

                  <button
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">No products found</h2>
            <p className="text-gray-600">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
            <button
              className="mt-4 rounded-full bg-primary px-4 py-2 text-white hover:bg-primary/90"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setActiveStore('');
                setPriceRange([0, 10]);
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main component that wraps ProductContent in a Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <ProductContent />
    </Suspense>
  );
} 