import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Cart Test API - Starting test');
    
    // 1. Find a test user (we'll use the first user in the system)
    const users = await prisma.$queryRaw`
      SELECT * FROM "User" LIMIT 1
    `;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      console.log('Cart Test API - No users found');
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }
    
    const userId = users[0].id;
    console.log('Cart Test API - Using user ID:', userId);
    
    // 2. Find or create cart for the test user
    let cart = await prisma.$queryRaw`
      SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
    `;
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.log('Cart Test API - Creating new cart for user');
      
      await prisma.$executeRaw`
        INSERT INTO "Cart" ("userId", "createdAt", "updatedAt") 
        VALUES (${userId}, NOW(), NOW())
      `;
      
      cart = await prisma.$queryRaw`
        SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
      `;
    }
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.log('Cart Test API - Failed to create cart');
      return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
    }
    
    const cartId = cart[0].id;
    console.log('Cart Test API - Using cart ID:', cartId);
    
    // 3. Get a product to add (first product)
    const products = await prisma.$queryRaw`
      SELECT * FROM "Product" LIMIT 1
    `;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log('Cart Test API - No products found');
      return NextResponse.json({ error: 'No products found' }, { status: 404 });
    }
    
    const productId = products[0].id;
    console.log('Cart Test API - Using product ID:', productId);
    
    // 4. Get a store ID
    const stores = await prisma.$queryRaw`
      SELECT * FROM "Store" LIMIT 1
    `;
    
    if (!stores || !Array.isArray(stores) || stores.length === 0) {
      console.log('Cart Test API - No stores found');
      return NextResponse.json({ error: 'No stores found' }, { status: 404 });
    }
    
    const storeId = stores[0].id;
    console.log('Cart Test API - Using store ID:', storeId);
    
    // 5. Add the product to the cart
    const quantity = 1;
    
    try {
      console.log('Cart Test API - Adding test item to cart');
      
      // Check if item already exists in cart
      const existingItem = await prisma.$queryRaw`
        SELECT * FROM "CartItem" 
        WHERE "cartId" = ${cartId} AND "productId" = ${productId} AND "storeId" = ${storeId}
        LIMIT 1
      `;
      
      if (existingItem && Array.isArray(existingItem) && existingItem.length > 0) {
        console.log('Cart Test API - Updating existing item');
        
        await prisma.$executeRaw`
          UPDATE "CartItem" 
          SET "quantity" = "quantity" + ${quantity}, "updatedAt" = NOW()
          WHERE "id" = ${existingItem[0].id}
        `;
        
        return NextResponse.json({
          success: true,
          message: 'Item quantity updated in test cart',
          existingItemId: existingItem[0].id
        });
      }
      
      // Add new item
      const result = await prisma.$executeRaw`
        INSERT INTO "CartItem" ("cartId", "productId", "quantity", "storeId", "createdAt", "updatedAt")
        VALUES (${cartId}, ${productId}, ${quantity}, ${storeId}, NOW(), NOW())
      `;
      
      console.log('Cart Test API - Item added successfully, result:', result);
      
      // 6. Get all cart items for this cart to verify
      const cartItems = await prisma.$queryRaw`
        SELECT * FROM "CartItem" WHERE "cartId" = ${cartId}
      `;
      
      return NextResponse.json({
        success: true,
        message: 'Item added to test cart',
        userId,
        cartId,
        productId,
        storeId,
        cartItems,
        result
      });
      
    } catch (error: any) {
      console.error('Cart Test API - Error:', error);
      return NextResponse.json({
        error: `Failed to add item: ${error.message || 'Unknown error'}`,
        errorDetail: error
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Cart Test API - Error:', error);
    return NextResponse.json({
      error: `Test failed: ${error.message || 'Unknown error'}`
    }, { status: 500 });
  }
} 