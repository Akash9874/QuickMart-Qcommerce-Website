'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Store {
  id: number;
  name: string;
  address: string;
  image: string;
  description: string;
}

// Mock data for stores
const STORES: Store[] = [
  {
    id: 1,
    name: 'FreshMart',
    address: '123 Main Street, Anytown',
    image: '/stores/freshmart.svg',
    description: 'A wide variety of fresh produce and groceries at competitive prices.'
  },
  {
    id: 2,
    name: 'QuickStop',
    address: '456 Elm Avenue, Somewhere',
    image: '/stores/quickstop.svg',
    description: 'Your convenient neighborhood store for all your daily needs.'
  },
  {
    id: 3,
    name: 'ValuGrocer',
    address: '789 Oak Boulevard, Elsewhere',
    image: '/stores/valugrocer.svg',
    description: 'Everyday low prices on all your grocery essentials.'
  }
];

export default function StoresPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading stores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Our Partner Stores</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STORES.map((store) => (
          <Card key={store.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="aspect-video relative bg-gray-100">
              <Image
                src={store.image}
                alt={`${store.name} logo`}
                fill
                className="object-contain p-4"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{store.name}</h2>
              <p className="text-gray-600 text-sm mb-4">{store.address}</p>
              <p className="text-gray-700 mb-4">{store.description}</p>
              <Link 
                href={`/stores/${store.name.toLowerCase().replace(/\s+/g, '')}`}
                className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
              >
                View Products
              </Link>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Price Comparison</h2>
        <p className="mb-6">
          QuickMart helps you compare prices across all our partner stores to find the best deals on your favorite products.
        </p>
        <Link
          href="/compare"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition font-medium"
        >
          Compare Prices Now
        </Link>
      </div>
    </div>
  );
} 