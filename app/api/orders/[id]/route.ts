import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required to access order details' },
        { status: 401 }
      );
    }

    // Get user by email from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get order with items, ensuring it belongs to the authenticated user
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id, // Ensure the order belongs to the user
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      // Check if the order exists at all
      const anyOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (anyOrder) {
        // Order exists but doesn't belong to this user
        return NextResponse.json(
          { error: 'You do not have permission to view this order' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch product and store details for each order item
    const orderWithDetails = {
      ...order,
      items: await Promise.all(
        order.items.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              image: true,
            },
          });

          const store = await prisma.store.findUnique({
            where: { id: item.storeId },
            select: {
              id: true,
              name: true,
            },
          });

          return {
            ...item,
            product,
            store,
          };
        })
      ),
    };

    return NextResponse.json({ order: orderWithDetails });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
} 