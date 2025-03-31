'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

// Store data should be fetched from an API in a real app
const storeData = {
  freshmart: {
    name: 'FreshMart',
    description: 'A wide variety of fresh produce and groceries at competitive prices.'
  },
  quickstop: {
    name: 'QuickStop',
    description: 'Your convenient neighborhood store for all your daily needs.'
  },
  valugrocer: {
    name: 'ValuGrocer',
    description: 'Everyday low prices on all your grocery essentials.'
  }
};

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const slug = params.slug as string;
  
  // Find store by slug
  const store = storeData[slug as keyof typeof storeData];
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading store information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
          <h1 className="text-2xl font-bold text-destructive">Store not found</h1>
          <p className="text-muted-foreground">The store you're looking for doesn't exist.</p>
          <Link href="/stores" className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to all stores
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link href="/stores" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to all stores
        </Link>
      </nav>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{store.name}</h1>
        <p className="text-muted-foreground">{store.description}</p>
      </div>
      
      {/* Placeholder for store products */}
      <div className="bg-muted p-12 rounded-md flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">
            Product listings for {store.name} are being added.
          </p>
        </div>
      </div>
    </div>
  );
} 