import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user by email using raw SQL
    const userEmail = session.user.email;
    const users = await prisma.$queryRaw`
      SELECT * FROM "User" WHERE "email" = ${userEmail} LIMIT 1
    `;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = users[0].id;

    // Find the cart
    const carts = await prisma.$queryRaw`
      SELECT * FROM "Cart" WHERE "userId" = ${userId} LIMIT 1
    `;

    if (!carts || !Array.isArray(carts) || carts.length === 0) {
      return NextResponse.json({
        id: null,
        items: [],
        totalAmount: 0,
      });
    }

    const cartId = carts[0].id;

    // Get cart items with product and store information
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
    }

    // Calculate total amount
    const totalAmount = formattedItems.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    return NextResponse.json({
      id: cartId,
      items: formattedItems,
      totalAmount,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
} 