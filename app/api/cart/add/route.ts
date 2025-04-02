import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Cart Add API - Request received');
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.log('Cart Add API - Unauthorized: No session or email');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to add items to your cart' },
        { status: 401 }
      );
    }

    // Get the request body
    let body;
    try {
      body = await request.json();
      console.log('Cart Add API - Request body:', JSON.stringify(body));
    } catch (error) {
      console.error('Cart Add API - Invalid request body:', error);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { productId, quantity = 1, storeId = 1 } = body;  // Default to storeId 1 if not provided
    console.log(`Cart Add API - Adding product: ${productId}, quantity: ${quantity}, store: ${storeId}`);

    if (!productId) {
      console.log('Cart Add API - Missing productId');
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Find the user by email using raw SQL to avoid schema mismatches
    const userEmail = session.user.email;
    console.log('Cart Add API - Finding user with email:', userEmail);
    
    const user = await prisma.$queryRaw`
      SELECT * FROM "User" WHERE "email" = ${userEmail} LIMIT 1
    `;

    if (!user || !Array.isArray(user) || user.length === 0) {
      console.error('Cart Add API - User not found with email:', userEmail);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user[0].id;
    console.log('Cart Add API - Found user with ID:', userId);

    // Find or create cart using raw SQL
    let cart = await prisma.$queryRaw`
      SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
    `;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.log('Cart Add API - Creating new cart for user:', userId);
      
      try {
        await prisma.$executeRaw`
          INSERT INTO "Cart" ("userId", "createdAt", "updatedAt") 
          VALUES (${userId}, NOW(), NOW())
        `;
        
        console.log('Cart Add API - New cart created successfully');
        
        cart = await prisma.$queryRaw`
          SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
        `;
      } catch (createCartError) {
        console.error('Cart Add API - Error creating cart:', createCartError);
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        );
      }
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.error('Cart Add API - Cart still not found after creation attempt');
      return NextResponse.json(
        { error: 'Failed to create or retrieve cart' },
        { status: 500 }
      );
    }

    const cartId = (cart as any[])[0].id;
    console.log('Cart Add API - Using cart with ID:', cartId);

    // Check if item already exists in cart using raw SQL
    const existingItem = await prisma.$queryRaw`
      SELECT * FROM "CartItem" 
      WHERE "cartId" = ${cartId} AND "productId" = ${parseInt(productId)} AND "storeId" = ${parseInt(String(storeId))}
      LIMIT 1
    `;

    if (existingItem && Array.isArray(existingItem) && existingItem.length > 0) {
      console.log('Cart Add API - Updating existing cart item:', existingItem[0].id);
      
      // Update quantity of existing item
      try {
        await prisma.$executeRaw`
          UPDATE "CartItem" 
          SET "quantity" = "quantity" + ${quantity}, "updatedAt" = NOW()
          WHERE "id" = ${existingItem[0].id}
        `;
        
        console.log('Cart Add API - Item quantity updated successfully');
      } catch (updateError) {
        console.error('Cart Add API - Error updating cart item:', updateError);
        return NextResponse.json(
          { error: 'Failed to update cart item' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Item quantity updated in cart'
      });
    }

    // Add new item to cart
    try {
      console.log('Cart Add API - Adding new item to cart');
      
      // Use a Prisma client function for better debugging
      const result = await prisma.$executeRaw`
        INSERT INTO "CartItem" ("cartId", "productId", "quantity", "storeId", "createdAt", "updatedAt")
        VALUES (${cartId}, ${parseInt(productId)}, ${quantity}, ${parseInt(String(storeId))}, NOW(), NOW())
      `;
      
      console.log('Cart Add API - New item added successfully, result:', result);
    } catch (insertError: any) {
      console.error('Cart Add API - Error adding item to cart:', insertError);
      return NextResponse.json(
        { error: `Failed to add item to cart: ${insertError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart'
    });

  } catch (error: any) {
    console.error('Cart Add API - Error adding item to cart:', error);
    return NextResponse.json(
      { error: `Failed to add item to cart: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 