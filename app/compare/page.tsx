'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ComparisonTable from '../components/ComparisonTable';
import ProductCard from '../components/ProductCard';

// Define interfaces to match the component expectations
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
  image: string | null;
  description: string;
  prices: Price[];
}

// Mock data - this would typically come from an API
const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: 'Organic Bananas',
    image: '/products/bananas.jpg',
    description: 'Fresh organic bananas, perfect for smoothies',
    prices: [
      { store: 'FreshMart', amount: 1.99, storeId: 1 },
      { store: 'QuickStop', amount: 2.49, storeId: 2 },
      { store: 'ValuGrocer', amount: 1.89, storeId: 3 }
    ]
  },
  {
    id: 2,
    name: 'Whole Milk',
    image: '/products/milk.jpg',
    description: 'Farm fresh whole milk, 1 gallon',
    prices: [
      { store: 'FreshMart', amount: 3.49, storeId: 1 },
      { store: 'QuickStop', amount: 3.29, storeId: 2 },
      { store: 'ValuGrocer', amount: 3.59, storeId: 3 }
    ]
  },
  {
    id: 3,
    name: 'Bread',
    image: '/products/bread.jpg',
    description: 'Freshly baked whole wheat bread',
    prices: [
      { store: 'FreshMart', amount: 2.99, storeId: 1 },
      { store: 'QuickStop', amount: 3.19, storeId: 2 },
      { store: 'ValuGrocer', amount: 2.79, storeId: 3 }
    ]
  },
  {
    id: 4,
    name: 'Eggs',
    image: '/products/eggs.jpg',
    description: 'Farm fresh large eggs, dozen',
    prices: [
      { store: 'FreshMart', amount: 3.99, storeId: 1 },
      { store: 'QuickStop', amount: 3.49, storeId: 2 },
      { store: 'ValuGrocer', amount: 3.79, storeId: 3 }
    ]
  }
];

const stores = ['FreshMart', 'QuickStop', 'ValuGrocer'];

export default function ComparePage() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof DUMMY_PRODUCTS>([]);
  const [isSearching, setIsSearching] = useState(false);

  // This would be replaced with actual API calls in a real application
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simple client-side search for the demo
    setTimeout(() => {
      const results = DUMMY_PRODUCTS.filter(
        product => 
          !selectedProducts.includes(product.id) && (
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchQuery, selectedProducts]);

  const addProduct = (productId: number) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
      setSearchQuery('');
    }
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(id => id !== productId));
  };

  // Get the full product objects for selected IDs
  const selectedProductsData = products.filter(product => 
    selectedProducts.includes(product.id)
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Compare Prices</h1>
      
      {/* Product Search */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Products to Compare</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products to compare..."
            className="w-full p-3 border border-gray-300 rounded-md pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        {/* Search Results */}
        {searchQuery && (
          <div className="mt-4">
            {isSearching ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                    </div>
                    <button
                      className="btn btn-primary text-sm py-1 px-3"
                      onClick={() => addProduct(product.id)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No matching products found
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Selected Products */}
      {selectedProductsData.length > 0 ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Selected Products</h2>
            <button
              className="text-red-500 hover:text-red-700 text-sm font-medium"
              onClick={() => setSelectedProducts([])}
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {selectedProductsData.map(product => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <button
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                  onClick={() => removeProduct(product.id)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-red-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <h2 className="text-xl font-semibold mb-4">Price Comparison</h2>
          <ComparisonTable products={selectedProductsData} stores={stores} />
          
          <div className="mt-8 bg-light p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Shopping Tips</h3>
            <p className="text-gray-700 mb-4">
              Based on your selection, shopping at <span className="font-semibold text-primary">ValuGrocer</span> would 
              save you the most money for these items.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/stores/valugrocer" className="btn btn-primary">
                Shop at ValuGrocer
              </Link>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  // In a real app, this would save the comparison or generate a list
                  alert('Shopping list saved!');
                }}
              >
                Save Shopping List
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-light rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No Products Selected</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Add products to compare their prices across different stores and find the best deals.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
} 