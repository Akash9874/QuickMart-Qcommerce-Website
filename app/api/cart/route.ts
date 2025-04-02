import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Cart API - Unauthorized: No session or email');
      return NextResponse.json({ items: [], totalAmount: 0 }, { status: 200 });
    }

    try {
      // Find the user by email using raw SQL
      const userEmail = session.user.email;
      console.log('Cart API - Looking up user with email:', userEmail);
      
      // Begin with a safe default response
      const emptyResponse = {
        id: null,
        items: [],
        totalAmount: 0
      };
      
      const users = await prisma.$queryRaw`
        SELECT * FROM "User" WHERE "email" = ${userEmail} LIMIT 1
      `;

      if (!users || !Array.isArray(users) || users.length === 0) {
        console.log('Cart API - User not found for email:', userEmail);
        return NextResponse.json(emptyResponse);
      }

      const userId = users[0].id;
      console.log('Cart API - Found user with ID:', userId);

      // Find the cart
      const carts = await prisma.$queryRaw`
        SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
      `;

      if (!carts || !Array.isArray(carts) || carts.length === 0) {
        console.log('Cart API - No cart found for user:', userId);
        return NextResponse.json(emptyResponse);
      }

      const cartId = carts[0].id;
      console.log('Cart API - Found cart with ID:', cartId);

      // Get cart items with product and store information
      try {
        const cartItems = await prisma.$queryRaw`
          SELECT ci.id, ci.quantity, ci."productId", ci."storeId",
                p.name as productname, p.description as productdescription, p.image as productimage,
                s.name as storename
          FROM "CartItem" ci
          JOIN "Product" p ON ci."productId" = p.id
          JOIN "Store" s ON ci."storeId" = s.id
          WHERE ci."cartId" = ${cartId}
        `;

        if (!cartItems || !Array.isArray(cartItems)) {
          console.log('Cart API - No cart items found for cart:', cartId);
          return NextResponse.json({
            id: cartId,
            items: [],
            totalAmount: 0,
          });
        }

        // Format items for the response and get product IDs
        const formattedItems = [];
        
        // Process each cart item to build the response
        for (const item of cartItems as any[]) {
          try {
            // For each product, get its price from the Price table
            const productPrices = await prisma.$queryRaw`
              SELECT "amount"
              FROM "Price"
              WHERE "productId" = ${item.productId}
              ORDER BY "amount" ASC
              LIMIT 1
            `;
            
            const price = productPrices && Array.isArray(productPrices) && productPrices.length > 0 
              ? productPrices[0].amount 
              : 0;
            
            formattedItems.push({
              id: item.id,
              productId: item.productId,
              product: {
                id: item.productId,
                name: item.productname,
                description: item.productdescription,
                image: item.productimage,
                price: price,
                store: {
                  id: item.storeId,
                  name: item.storename,
                },
              },
              quantity: item.quantity,
            });
          } catch (itemError) {
            console.error('Cart API - Error processing cart item:', itemError);
            // Continue with other items even if one fails
          }
        }

        // Calculate total amount
        const totalAmount = formattedItems.reduce(
          (sum, item) => sum + (item.product.price * item.quantity),
          0
        );

        const response = {
          id: cartId,
          items: formattedItems,
          totalAmount,
        };
        
        return NextResponse.json(response);
      } catch (cartItemsError) {
        console.error('Cart API - Error fetching cart items:', cartItemsError);
        // Return empty cart instead of error
        return NextResponse.json({
          id: cartId,
          items: [],
          totalAmount: 0,
        });
      }
    } catch (dbError) {
      console.error('Cart API - Database error:', dbError);
      // Return empty cart data structure rather than an error
      return NextResponse.json({
        id: null,
        items: [],
        totalAmount: 0,
      });
    }
  } catch (error) {
    console.error('Cart API - Error in cart route:', error);
    // Return empty cart data structure rather than an error
    return NextResponse.json({
      id: null,
      items: [],
      totalAmount: 0,
    });
  }
} 