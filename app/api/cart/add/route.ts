import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { productId, quantity = 1, storeId = 1 } = body;  // Default to storeId 1 if not provided

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Find the user by email using raw SQL to avoid schema mismatches
    const userEmail = session.user.email;
    console.log('Finding user with email:', userEmail);
    
    const user = await prisma.$queryRaw`
      SELECT * FROM "User" WHERE "email" = ${userEmail} LIMIT 1
    `;

    if (!user || !Array.isArray(user) || user.length === 0) {
      console.error('User not found with email:', userEmail);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user[0].id;
    console.log('Found user with ID:', userId);

    // Find or create cart using raw SQL
    let cart = await prisma.$queryRaw`
      SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
    `;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.log('Creating new cart for user:', userId);
      
      await prisma.$executeRaw`
        INSERT INTO "Cart" ("userId") VALUES (${userId})
      `;
      
      cart = await prisma.$queryRaw`
        SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
      `;
    }

    const cartId = (cart as any[])[0].id;
    console.log('Using cart with ID:', cartId);

    // Check if item already exists in cart using raw SQL
    const existingItem = await prisma.$queryRaw`
      SELECT * FROM "CartItem" 
      WHERE "cartId" = ${cartId} AND "productId" = ${parseInt(productId)}
      LIMIT 1
    `;

    if (existingItem && Array.isArray(existingItem) && existingItem.length > 0) {
      console.log('Updating existing cart item:', existingItem[0].id);
      
      // Update quantity of existing item
      await prisma.$executeRaw`
        UPDATE "CartItem" 
        SET "quantity" = "quantity" + ${quantity}
        WHERE "id" = ${existingItem[0].id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Item quantity updated in cart'
      });
    }

    // Add new item to cart
    // We'll use the storeId directly provided or default to 1
    await prisma.$executeRaw`
      INSERT INTO "CartItem" ("cartId", "productId", "quantity", "storeId", "createdAt", "updatedAt")
      VALUES (${cartId}, ${parseInt(productId)}, ${quantity}, ${storeId}, NOW(), NOW())
    `;

    return NextResponse.json({
      success: true,
      message: 'Item added to cart'
    });

  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
} 