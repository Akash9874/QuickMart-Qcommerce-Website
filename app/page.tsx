'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from './components/ProductCard';
import LoadingSpinner from './components/LoadingSpinner';

// Use the same interfaces as defined in ProductCard component
interface Store {
  id: number;
  name: string;
}

interface Price {
  store: Store;
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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching featured products
    // In a real app, this would call an actual API
    const fetchMockProducts = () => {
      try {
        setLoading(true);
        
        // Mock data that matches our interface
        const mockProducts: Product[] = [
          {
            id: 1,
            name: 'Organic Bananas',
            image: '/products/bananas.jpg',
            description: 'Fresh organic bananas, perfect for smoothies',
            prices: [
              {
                amount: 1.99,
                store: { id: 1, name: 'FreshMart' },
                storeId: 1
              },
              {
                amount: 2.49, 
                store: { id: 2, name: 'QuickStop' },
                storeId: 2
              },
              {
                amount: 1.89,
                store: { id: 3, name: 'ValuGrocer' },
                storeId: 3
              }
            ]
          },
          {
            id: 2,
            name: 'Whole Milk',
            image: '/products/milk.jpg',
            description: 'Farm fresh whole milk, 1 gallon',
            prices: [
              {
                amount: 3.49,
                store: { id: 1, name: 'FreshMart' },
                storeId: 1
              },
              {
                amount: 3.29, 
                store: { id: 2, name: 'QuickStop' },
                storeId: 2
              },
              {
                amount: 3.59,
                store: { id: 3, name: 'ValuGrocer' },
                storeId: 3
              }
            ]
          },
          {
            id: 3,
            name: 'Bread',
            image: '/products/bread.jpg',
            description: 'Freshly baked whole wheat bread',
            prices: [
              {
                amount: 2.99,
                store: { id: 1, name: 'FreshMart' },
                storeId: 1
              },
              {
                amount: 3.19, 
                store: { id: 2, name: 'QuickStop' },
                storeId: 2
              },
              {
                amount: 2.79,
                store: { id: 3, name: 'ValuGrocer' },
                storeId: 3
              }
            ]
          },
          {
            id: 4,
            name: 'Eggs',
            image: '/products/eggs.jpg',
            description: 'Farm fresh large eggs, dozen',
            prices: [
              {
                amount: 3.99,
                store: { id: 1, name: 'FreshMart' },
                storeId: 1
              },
              {
                amount: 3.49, 
                store: { id: 2, name: 'QuickStop' },
                storeId: 2
              },
              {
                amount: 3.79,
                store: { id: 3, name: 'ValuGrocer' },
                storeId: 3
              }
            ]
          }
        ];
        
        setTimeout(() => {
          setFeaturedProducts(mockProducts);
          setLoading(false);
        }, 500); // Simulate network delay
      } catch (err) {
        console.error('Error loading featured products:', err);
        setError('Failed to load featured products');
        setLoading(false);
      }
    };

    fetchMockProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1A535C] via-[#4ECDC4]/90 to-[#1A535C] py-20 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-full grid-pattern opacity-10"></div>
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#4ECDC4] opacity-20 blur-3xl"></div>
          <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-[#FFE66D] opacity-20 blur-3xl"></div>
        </div>
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
              Compare Prices,{" "}
              <span className="bg-gradient-to-r from-white to-[#FFE66D] bg-clip-text text-transparent">
                Save Money
              </span>
            </h1>
            <p className="mb-10 text-lg md:text-xl text-white/90">
              Find the best deals on groceries and household items across multiple stores in one place.
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link 
                href="/products" 
                className="btn btn-primary flex items-center justify-center group"
              >
                Browse Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link 
                href="/stores" 
                className="btn btn-outline bg-transparent text-white border-white hover:bg-white hover:text-[#1A535C] transition-all duration-300"
              >
                View Stores
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F7FFF7] to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#1A535C]">How QuickMart Works</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F7FFF7] text-[#1A535C]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Find Products</h3>
              <p className="text-gray-600">
                Browse through a wide range of products from various stores.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F7FFF7] text-[#1A535C]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Compare Prices</h3>
              <p className="text-gray-600">
                Compare prices across different stores to find the best deals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F7FFF7] text-[#1A535C]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Save Money</h3>
              <p className="text-gray-600">
                Add products to your cart and checkout to save money on your shopping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-[#F7FFF7] py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#1A535C] mb-3">Featured Products</h2>
            <div className="mx-auto w-20 h-1 bg-[#4ECDC4] rounded-full mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of top products with the best price comparisons across multiple stores.</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="large" />
            </div>
          ) : error ? (
            <div className="rounded bg-red-100 p-6 text-center text-red-700 max-w-xl mx-auto shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Oops! Something went wrong</h3>
              <p>{error}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded bg-white p-8 text-center shadow-sm max-w-xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">No featured products available at the moment.</p>
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Link href="/products" className="btn btn-primary inline-flex items-center group">
              View All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#1A535C]">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">J</div>
                </div>
                <div>
                  <h3 className="font-semibold">John Doe</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic text-gray-600">
                "QuickMart has saved me so much money on my weekly grocery shopping. I can easily compare prices and find the best deals."
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">S</div>
                </div>
                <div>
                  <h3 className="font-semibold">Sarah Johnson</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="italic text-gray-600">
                "I love the price comparison feature. It's so convenient to see all the prices in one place without having to visit multiple store websites."
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">M</div>
                </div>
                <div>
                  <h3 className="font-semibold">Michael Brown</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(4)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="italic text-gray-600">
                "QuickMart has become my go-to platform for comparing prices before making a purchase. The user interface is intuitive and easy to use."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#FF6B6B] py-16 text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Start Saving Today</h2>
            <p className="mb-8 text-lg">
              Join thousands of smart shoppers who are already saving money with QuickMart.
            </p>
            <Link href="/register" className="btn bg-white text-[#FF6B6B] hover:bg-gray-100">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 