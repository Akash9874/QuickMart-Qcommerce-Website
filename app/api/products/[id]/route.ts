import { NextRequest, NextResponse } from 'next/server';

// Mock product data
const products = [
  {
    id: 3,
    name: 'Bread',
    description: 'Freshly baked whole wheat bread. Made with 100% whole wheat flour.',
    image: 'bread.jpg',
    prices: [
      { amount: 2.99, store: { id: 1, name: 'FreshMart' }, storeId: 1 },
      { amount: 3.19, store: { id: 2, name: 'QuickStop' }, storeId: 2 },
      { amount: 2.79, store: { id: 3, name: 'ValuGrocer' }, storeId: 3 }
    ]
  },
  {
    id: 2,
    name: 'Whole Milk',
    description: 'Farm fresh whole milk, 1 gallon. Pasteurized for safety.',
    image: 'milk.jpg',
    prices: [
      { amount: 3.49, store: { id: 1, name: 'FreshMart' }, storeId: 1 },
      { amount: 3.29, store: { id: 2, name: 'QuickStop' }, storeId: 2 },
      { amount: 3.59, store: { id: 3, name: 'ValuGrocer' }, storeId: 3 }
    ]
  },
  {
    id: 4,
    name: 'Eggs',
    description: 'Farm fresh organic eggs from free-range chickens. Dozen.',
    image: 'eggs.jpg',
    prices: [
      { amount: 3.99, store: { id: 1, name: 'FreshMart' }, storeId: 1 },
      { amount: 3.49, store: { id: 2, name: 'QuickStop' }, storeId: 2 },
      { amount: 3.79, store: { id: 3, name: 'ValuGrocer' }, storeId: 3 }
    ]
  },
  {
    id: 1,
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, perfect for smoothies or a quick snack.',
    image: 'bananas.jpg',
    prices: [
      { amount: 1.99, store: { id: 1, name: 'FreshMart' }, storeId: 1 },
      { amount: 2.49, store: { id: 2, name: 'QuickStop' }, storeId: 2 },
      { amount: 1.89, store: { id: 3, name: 'ValuGrocer' }, storeId: 3 }
    ]
  },
  {
    id: 5,
    name: 'Organic Chicken',
    description: 'Free-range organic chicken breast, 1 pound. No antibiotics or hormones.',
    image: 'chicken.jpg',
    prices: [
      { amount: 6.99, store: { id: 1, name: 'FreshMart' }, storeId: 1 },
      { amount: 6.49, store: { id: 2, name: 'QuickStop' }, storeId: 2 },
      { amount: 5.99, store: { id: 3, name: 'ValuGrocer' }, storeId: 3 }
    ]
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error in GET /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 