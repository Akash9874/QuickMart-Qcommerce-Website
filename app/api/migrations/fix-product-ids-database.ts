import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// This is a migration to ensure database product IDs match the mock products in the API
export async function GET() {
  try {
    console.log('Starting database product ID migration...');

    // 1. First, let's check if we have database access
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    // 2. Delete all cart items to avoid foreign key issues
    console.log('Clearing cart items...');
    await prisma.cartItem.deleteMany({});

    // 3. Delete all prices
    console.log('Clearing prices...');
    await prisma.price.deleteMany({});

    // 4. Delete all products (since we'll recreate them with correct IDs)
    console.log('Clearing products...');
    await prisma.product.deleteMany({});

    // 5. Create products with correct IDs matching the mock data
    console.log('Creating products with correct IDs...');
    const productData = [
      {
        id: 1,
        name: 'Organic Bananas',
        description: 'Fresh organic bananas, perfect for smoothies or a quick snack.',
        image: '/products/bananas.jpg',
        categoryId: 1
      },
      {
        id: 2,
        name: 'Whole Milk',
        description: 'Farm fresh whole milk, 1 gallon. Pasteurized for safety.',
        image: '/products/milk.jpg',
        categoryId: 2
      },
      {
        id: 3,
        name: 'Bread',
        description: 'Freshly baked whole wheat bread. Made with 100% whole wheat flour.',
        image: '/products/bread.jpg',
        categoryId: 3
      },
      {
        id: 4,
        name: 'Eggs',
        description: 'Farm fresh organic eggs from free-range chickens. Dozen.',
        image: '/products/eggs.jpg',
        categoryId: 2
      },
      {
        id: 5,
        name: 'Organic Chicken',
        description: 'Free-range organic chicken breast, 1 pound. No antibiotics or hormones.',
        image: '/products/chicken.jpg',
        categoryId: 4
      }
    ];

    // Create all products with specific IDs
    for (const product of productData) {
      await prisma.product.create({
        data: product
      });
    }

    // 6. Recreate prices for all products at all stores
    console.log('Creating prices for products...');
    
    // Store IDs 1, 2, 3 for FreshMart, QuickStop, and ValuGrocer
    const priceData = [
      // Organic Bananas (id: 1)
      { productId: 1, storeId: 1, amount: 1.99 },
      { productId: 1, storeId: 2, amount: 2.49 },
      { productId: 1, storeId: 3, amount: 1.89 },
      
      // Whole Milk (id: 2)
      { productId: 2, storeId: 1, amount: 3.49 },
      { productId: 2, storeId: 2, amount: 3.29 },
      { productId: 2, storeId: 3, amount: 3.59 },
      
      // Bread (id: 3)
      { productId: 3, storeId: 1, amount: 2.99 },
      { productId: 3, storeId: 2, amount: 3.19 },
      { productId: 3, storeId: 3, amount: 2.79 },
      
      // Eggs (id: 4)
      { productId: 4, storeId: 1, amount: 3.99 },
      { productId: 4, storeId: 2, amount: 3.49 },
      { productId: 4, storeId: 3, amount: 3.79 },
      
      // Organic Chicken (id: 5)
      { productId: 5, storeId: 1, amount: 6.99 },
      { productId: 5, storeId: 2, amount: 6.49 },
      { productId: 5, storeId: 3, amount: 5.99 }
    ];

    for (const price of priceData) {
      await prisma.price.create({
        data: price
      });
    }

    console.log('Migration completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Product IDs fixed in database. The database now matches the mock data in the API.'
    });
  } catch (error) {
    console.error('Error in migration:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 