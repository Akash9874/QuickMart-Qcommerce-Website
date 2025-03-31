import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock product data - matches the same IDs as in [id]/route.ts
const products = [
  {
    id: 3,
    name: 'Bread',
    description: 'Freshly baked whole wheat bread',
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
    description: 'Farm fresh whole milk, 1 gallon',
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
    description: 'Farm fresh large eggs, dozen',
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
    description: 'Fresh organic bananas, perfect for smoothies',
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
    description: 'Free-range organic chicken breast, 1 pound',
    image: 'chicken.jpg',
    prices: [
      { amount: 6.99, store: { id: 1, name: 'FreshMart' }, storeId: 1 },
      { amount: 6.49, store: { id: 2, name: 'QuickStop' }, storeId: 2 },
      { amount: 5.99, store: { id: 3, name: 'ValuGrocer' }, storeId: 3 }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const category = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    // Build the query based on params
    const where: any = {};
    
    // Add featured filter if specified
    if (featured) {
      where.featured = true;
    }
    
    // Add category filter if specified
    if (category && category !== 'All') {
      where.category = category;
    }
    
    // Add search filter if specified
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Get products with their prices, including store info
    const products = await prisma.product.findMany({
      where,
      take: limit,
      include: {
        prices: {
          include: {
            store: true,
          },
          orderBy: {
            amount: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ 
      products,
      count: products.length
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 