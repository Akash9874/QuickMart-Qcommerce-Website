import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  console.log('Starting cart database fix migration');
  
  try {
    // First check database access by counting users
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    console.log('Database connection successful, user count:', userCount);
    
    // 1. Fix missing timestamps in carts
    console.log('Fixing missing timestamps in carts...');
    const updatedCartsResult = await prisma.$executeRaw`
      UPDATE "Cart"
      SET 
        "createdAt" = NOW(),
        "updatedAt" = NOW()
      WHERE 
        "createdAt" IS NULL OR "updatedAt" IS NULL
    `;
    console.log(`Fixed timestamps for ${updatedCartsResult} carts`);
    
    // 2. Remove orphaned cart items (where product or store doesn't exist)
    console.log('Removing orphaned cart items with missing products or stores...');
    const deletedOrphanedItemsResult = await prisma.$executeRaw`
      DELETE FROM "CartItem"
      WHERE 
        "productId" NOT IN (SELECT id FROM "Product") OR
        "storeId" NOT IN (SELECT id FROM "Store")
    `;
    console.log(`Removed ${deletedOrphanedItemsResult} orphaned cart items`);
    
    // 3. Remove cart items with invalid cartId
    console.log('Removing cart items with invalid cart references...');
    const deletedCartItemsResult = await prisma.$executeRaw`
      DELETE FROM "CartItem"
      WHERE "cartId" NOT IN (SELECT id FROM "Cart")
    `;
    console.log(`Removed ${deletedCartItemsResult} cart items with invalid cart references`);
    
    // 4. Ensure all users have a cart
    console.log('Creating carts for users without one...');
    const usersWithoutCart = await prisma.$queryRaw`
      SELECT u.id 
      FROM "User" u
      LEFT JOIN "Cart" c ON c."userId" = u.id
      WHERE c.id IS NULL
    `;
    
    if (Array.isArray(usersWithoutCart) && usersWithoutCart.length > 0) {
      console.log(`Found ${usersWithoutCart.length} users without a cart, creating carts...`);
      
      for (const user of usersWithoutCart as any[]) {
        await prisma.$executeRaw`
          INSERT INTO "Cart" ("userId", "createdAt", "updatedAt")
          VALUES (${user.id}, NOW(), NOW())
        `;
      }
      
      console.log(`Created ${usersWithoutCart.length} new carts`);
    } else {
      console.log('All users have carts');
    }
    
    // 5. Validate cart item quantities
    console.log('Fixing invalid cart item quantities...');
    const fixedQuantitiesResult = await prisma.$executeRaw`
      UPDATE "CartItem"
      SET "quantity" = 1
      WHERE "quantity" < 1 OR "quantity" IS NULL
    `;
    console.log(`Fixed quantities for ${fixedQuantitiesResult} cart items`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Cart database fix completed successfully',
      details: {
        fixedCartTimestamps: updatedCartsResult,
        removedOrphanedItems: deletedOrphanedItemsResult,
        removedInvalidCartItems: deletedCartItemsResult,
        createdCartsForUsers: Array.isArray(usersWithoutCart) ? usersWithoutCart.length : 0,
        fixedQuantities: fixedQuantitiesResult
      }
    });
    
  } catch (error) {
    console.error('Error in cart database fix migration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix cart database',
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 